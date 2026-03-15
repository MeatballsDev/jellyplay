<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { usePlaylistStore } from '@/stores/playlist'
import CreatePlaylistModal from '@/components/playlist/CreatePlaylistModal.vue'

const props = defineProps({
  track: { type: Object, required: true },
  queue: { type: Array,  default: () => [] },
  x:     { type: Number, required: true },
  y:     { type: Number, required: true },
})

const emit   = defineEmits(['close'])
const player  = usePlayerStore()
const plStore = usePlaylistStore()
const menuEl  = ref(null)
const showCreate = ref(false)

// Clamp to viewport so menu never goes off-screen
const MENU_W = 210
const MENU_H = 300
const pos = computed(() => ({
  left: Math.min(props.x, window.innerWidth  - MENU_W - 8) + 'px',
  top:  Math.min(props.y, window.innerHeight - MENU_H - 8) + 'px',
}))

// ── Actions ────────────────────────────────────────────────────────────────
function playNow() {
  const q = props.queue.length ? props.queue : [props.track]
  player.playTrack(props.track, q)
  emit('close')
}

function playNext() {
  const idx = player.queueIndex + 1
  player.queue.splice(idx, 0, props.track)
  emit('close')
}

function addToQueue() {
  player.queue.push(props.track)
  emit('close')
}

function addToPlaylist(pl) {
  plStore.addToPlaylist(pl.id, props.track)
  emit('close')
}

function onCreateDone(pl) {
  plStore.addToPlaylist(pl.id, props.track)
  showCreate.value = false
  emit('close')
}

// ── Dismiss logic ──────────────────────────────────────────────────────────
function onMouseDown(e) {
  if (menuEl.value && !menuEl.value.contains(e.target)) emit('close')
}
function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}
function onScroll() { emit('close') }

onMounted(() => {
  // Defer so the triggering mousedown doesn't immediately close the menu
  setTimeout(() => {
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown',   onKeydown)
    window.addEventListener('scroll',     onScroll, true)
  }, 0)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onMouseDown)
  document.removeEventListener('keydown',   onKeydown)
  window.removeEventListener('scroll',     onScroll, true)
})
</script>

<template>
  <Teleport to="body">
    <div ref="menuEl" class="ctx-menu" :style="pos" role="menu">
      <!-- Track identity -->
      <div class="ctx-header">
        <span class="ctx-track-name">{{ track.Name }}</span>
        <span class="ctx-track-artist">{{ track.AlbumArtist || track.Artists?.[0] }}</span>
      </div>

      <div class="ctx-divider" />

      <!-- Playback actions -->
      <button class="ctx-item ctx-item--primary" @click="playNow">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="7 3 21 12 7 21"/>
        </svg>
        Play now
      </button>

      <button class="ctx-item" @click="playNext">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
        </svg>
        Play next
      </button>

      <button class="ctx-item" @click="addToQueue">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        Add to queue
      </button>

      <div class="ctx-divider" />

      <!-- Playlists -->
      <div class="ctx-section-label">Add to playlist</div>

      <div class="ctx-playlists">
        <button
          v-for="pl in plStore.playlists"
          :key="pl.id"
          class="ctx-item ctx-item--pl"
          @click="addToPlaylist(pl)"
        >
          <span class="pl-dot" />
          {{ pl.name }}
        </button>

        <div v-if="!plStore.playlists.length" class="ctx-empty">No playlists yet</div>
      </div>

      <button class="ctx-item ctx-item--new" @click="showCreate = true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New playlist
      </button>
    </div>

    <CreatePlaylistModal
      v-if="showCreate"
      @close="showCreate = false"
      @created="onCreateDone"
    />
  </Teleport>
</template>

<style scoped>
.ctx-menu {
  position: fixed;
  z-index: 9999;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(201, 169, 110, 0.04);
  min-width: 210px;
  overflow: hidden;
  padding: var(--space-xs);
  animation: ctx-in 120ms var(--ease-default);
  transform-origin: top left;
}

@keyframes ctx-in {
  from { opacity: 0; transform: scale(0.95) translateY(-4px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}

/* Header */
.ctx-header {
  padding: var(--space-sm) var(--space-md) var(--space-xs);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ctx-track-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}

.ctx-track-artist {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}

.ctx-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-xs) 0;
}

.ctx-section-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: var(--space-xs) var(--space-md);
}

/* Items */
.ctx-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  text-align: left;
  transition: background var(--duration-fast);
  white-space: nowrap;
}

.ctx-item:hover {
  background: var(--color-border);
}

/* Playlist list (scrollable if many) */
.ctx-playlists {
  max-height: 140px;
  overflow-y: auto;
}

.ctx-item--pl {
  padding-left: var(--space-md);
}

.pl-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-border);
  flex-shrink: 0;
  transition: background var(--duration-fast);
}

.ctx-item--pl:hover .pl-dot {
  background: var(--color-accent);
}

.ctx-empty {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
