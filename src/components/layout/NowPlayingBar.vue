<script setup>
import { ref, watch, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useLibraryStore } from '@/stores/library'
import { useAudio } from '@/composables/useAudio'
import { getStreamUrl } from '@/api/stream'
import PlaybackControls from '@/components/player/PlaybackControls.vue'
import ProgressBar from '@/components/player/ProgressBar.vue'
import VolumeControl from '@/components/player/VolumeControl.vue'
import TrackInfo from '@/components/player/TrackInfo.vue'
import EqualizerPanel from '@/components/equalizer/EqualizerPanel.vue'

const props  = defineProps({ eqOpen: Boolean, queueOpen: Boolean })
const emit   = defineEmits(['toggle-eq', 'toggle-queue'])

const player  = usePlayerStore()
const library = useLibraryStore()
const audio   = useAudio()

const audioEl = ref(null)
const audioKey = ref(0) // force re-render when src changes

onMounted(() => {
  player.setAudioElement(audioEl.value)
})

// When currentTrack changes → update src and play
watch(() => player.currentTrack, (track) => {
  if (!track) return
  library.addRecentlyPlayed(track)
  // src update is handled reactively via audioEl's src attribute
}, { immediate: false })

// Play/pause control
watch(() => player.isPlaying, (playing) => {
  if (!audioEl.value) return
  audio.resumeContext()
  if (playing) {
    audioEl.value.play().catch(() => { player.setPlaying(false) })
  } else {
    audioEl.value.pause()
  }
})

// Track changes → load new src
watch(() => player.currentTrack?.Id, () => {
  if (!audioEl.value || !player.currentTrack) return
  audioEl.value.src = getStreamUrl(player.currentTrack.Id)
  audioEl.value.load()
  if (player.isPlaying) {
    audioEl.value.play().catch(() => { player.setPlaying(false) })
  }
})

function onTimeUpdate() {
  player.setTime(audioEl.value?.currentTime || 0)
}

function onLoadedMetadata() {
  player.setDuration(audioEl.value?.duration || 0)
  audio.initAudioContext(audioEl.value)
  audio.resumeContext()
}

function onEnded() {
  if (player.repeatMode === 'one') {
    audioEl.value.currentTime = 0
    audioEl.value.play()
  } else {
    player.next()
  }
}

function onError() {
  player.setPlaying(false)
}
</script>

<template>
  <div class="nowplaying-wrap">
    <!-- EQ Panel slides up above the bar -->
    <Transition name="slide-up">
      <EqualizerPanel v-if="eqOpen" @close="emit('toggle-eq')" />
    </Transition>

    <div class="nowplaying-bar">
      <!-- Hidden audio element -->
      <audio
        ref="audioEl"
        preload="metadata"
        crossorigin="anonymous"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
        @error="onError"
      />

      <!-- Left: Track info -->
      <div class="bar-left">
        <TrackInfo />
      </div>

      <!-- Center: Controls + Progress -->
      <div class="bar-center">
        <PlaybackControls />
        <ProgressBar />
      </div>

      <!-- Right: Volume + Queue + EQ toggle -->
      <div class="bar-right">
        <VolumeControl />
        <button
          class="eq-toggle"
          :class="{ active: queueOpen }"
          title="Queue"
          @click="emit('toggle-queue')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6"  x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6"  x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          Queue
        </button>
        <button
          class="eq-toggle"
          :class="{ active: eqOpen }"
          title="Equalizer (E)"
          @click="emit('toggle-eq')"
        >
          EQ
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nowplaying-wrap {
  position: fixed;
  bottom: 0;
  left: var(--sidebar-width);
  right: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.nowplaying-bar {
  height: var(--nowplaying-height);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 0 var(--space-lg);
  gap: var(--space-lg);
}

.bar-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.bar-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.bar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-md);
}

.eq-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  transition: color var(--duration-base), background var(--duration-base);
}

.eq-toggle:hover,
.eq-toggle.active {
  color: var(--color-accent);
  background: var(--color-accent-dim);
}
</style>
