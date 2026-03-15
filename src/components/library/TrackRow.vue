<script setup>
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { formatDuration } from '@/api/stream'
import TrackContextMenu from '@/components/common/TrackContextMenu.vue'

const props = defineProps({
  track:       { type: Object,  required: true },
  index:       { type: Number,  default: null },
  queue:       { type: Array,   default: () => [] },
  showAlbum:   { type: Boolean, default: false },
  tableLayout: { type: Boolean, default: false },
})

const player = usePlayerStore()

const isActive = computed(() => player.currentTrack?.Id === props.track.Id)
const duration = computed(() => formatDuration(props.track.RunTimeTicks))

// Context menu state
const ctxVisible = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)

function openCtx(e) {
  e.preventDefault()
  ctxX.value = e.clientX
  ctxY.value = e.clientY
  ctxVisible.value = true
}

function play() {
  const q = props.queue.length ? props.queue : [props.track]
  player.playTrack(props.track, q)
}
</script>

<template>
  <div
    class="track-row"
    :class="{ active: isActive, 'track-row--table': tableLayout }"
    @dblclick="play"
    @contextmenu="openCtx"
  >
    <!-- Index / Playing indicator -->
    <div class="track-num">
      <span v-if="!isActive" class="num">{{ index !== null ? index + 1 : '' }}</span>
      <svg v-else class="playing-bars" width="12" height="12" viewBox="0 0 12 12">
        <rect x="0" y="2" width="2" height="8" rx="1" fill="var(--color-accent)">
          <animate attributeName="height" values="8;4;8" dur="0.8s" repeatCount="indefinite"/>
          <animate attributeName="y" values="2;4;2" dur="0.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="5" y="0" width="2" height="12" rx="1" fill="var(--color-accent)">
          <animate attributeName="height" values="12;6;12" dur="0.6s" repeatCount="indefinite"/>
          <animate attributeName="y" values="0;3;0" dur="0.6s" repeatCount="indefinite"/>
        </rect>
        <rect x="10" y="3" width="2" height="7" rx="1" fill="var(--color-accent)">
          <animate attributeName="height" values="7;3;7" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="y" values="3;5;3" dur="1s" repeatCount="indefinite"/>
        </rect>
      </svg>
      <button class="play-icon" @click="play" title="Play">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="7 3 21 12 7 21"/>
        </svg>
      </button>
    </div>

    <!-- Title (+ artist stacked when not table layout) -->
    <div class="track-main">
      <span class="track-name" :title="track.Name">{{ track.Name }}</span>
      <span v-if="!tableLayout" class="track-artist">{{ track.AlbumArtist || track.Artists?.[0] }}</span>
    </div>

    <!-- Artist column (table layout only) -->
    <div v-if="tableLayout" class="track-col track-col--artist">{{ track.AlbumArtist || track.Artists?.[0] }}</div>

    <!-- Album (optional) -->
    <div v-if="showAlbum || tableLayout" class="track-album">{{ track.Album }}</div>

    <!-- Duration -->
    <div class="track-duration">{{ duration }}</div>

    <!-- More button (also opens the context menu) -->
    <div class="track-actions">
      <button class="action-btn" title="More options" @click.stop="openCtx($event)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5"  cy="12" r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
          <circle cx="19" cy="12" r="1.5"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Context menu -->
  <TrackContextMenu
    v-if="ctxVisible"
    :track="track"
    :queue="queue"
    :x="ctxX"
    :y="ctxY"
    @close="ctxVisible = false"
  />
</template>

<style scoped>
.track-row {
  display: grid;
  grid-template-columns: 40px 1fr auto auto auto;
}

.track-row--table {
  grid-template-columns: 40px 1fr 1fr 1fr auto auto;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius);
  transition: background var(--duration-base) var(--ease-default);
  position: relative;
  cursor: default;
}

.track-row:hover {
  background: var(--color-surface-alt);
}

.active.track-row {
  background: var(--color-accent-dim);
}

.active.track-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-accent);
  border-radius: var(--border-radius) 0 0 var(--border-radius);
}

.track-num {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
}

.num {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.play-icon {
  position: absolute;
  color: var(--color-text-primary);
  display: none;
  align-items: center;
  justify-content: center;
}

.track-row:hover .num,
.track-row:hover .playing-bars {
  display: none;
}

.track-row:hover .play-icon {
  display: flex;
}

.track-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.track-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active .track-name {
  color: var(--color-accent);
}

.track-artist {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-col--artist,
.track-album {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* constrain album width when not in table layout */
.track-row:not(.track-row--table) .track-album {
  max-width: 160px;
}

.track-duration {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.track-actions {
  position: relative;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  padding: var(--space-xs);
  border-radius: var(--border-radius-sm);
  opacity: 0;
  transition: opacity var(--duration-base), color var(--duration-base);
}

.track-row:hover .action-btn {
  opacity: 1;
}

.action-btn:hover {
  color: var(--color-text-primary);
}
</style>
