<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaylistStore } from '@/stores/playlist'
import { usePlayerStore } from '@/stores/player'
import TrackRow from '@/components/library/TrackRow.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route   = useRoute()
const router  = useRouter()
const plStore = usePlaylistStore()
const player  = usePlayerStore()

const playlist = computed(() => plStore.playlists.find(p => p.id === route.params.id))

const isEditing = ref(false)
const editName  = ref('')

onMounted(() => {
  if (!playlist.value) router.push({ name: 'home' })
})

function startEdit() {
  editName.value = playlist.value.name
  isEditing.value = true
}

function saveEdit() {
  plStore.renamePlaylist(playlist.value.id, editName.value.trim() || playlist.value.name)
  isEditing.value = false
}

function playAll(index = 0) {
  if (playlist.value?.tracks.length) {
    player.playTrack(playlist.value.tracks[index], playlist.value.tracks)
  }
}

function shufflePlay() {
  if (!playlist.value?.tracks.length) return
  if (!player.shuffleOn) player.toggleShuffle()
  const randomIdx = Math.floor(Math.random() * playlist.value.tracks.length)
  player.playTrack(playlist.value.tracks[randomIdx], playlist.value.tracks)
}

// ── Drag-to-reorder ──────────────────────────────────────────────────────────
const DRAG_THRESHOLD = 6

const rowEls     = ref([])
const dragFrom   = ref(null)
const dropBefore = ref(null)
const dragPos    = ref({ x: 0, y: 0 })
const isDragging = computed(() => dragFrom.value !== null)

function setRowEl(el, i) {
  if (el) rowEls.value[i] = el
}

function startDrag(e, i) {
  if (e.button !== 0) return
  e.preventDefault()

  const startX = e.clientX
  const startY = e.clientY
  let activated = false

  function onMouseMove(e) {
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (!activated) {
      if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return
      activated        = true
      dragFrom.value   = i
      dropBefore.value = i
    }
    dragPos.value = { x: e.clientX, y: e.clientY }
    const rows = rowEls.value
    let before = rows.length
    for (let j = 0; j < rows.length; j++) {
      const rect = rows[j].getBoundingClientRect()
      if (e.clientY < rect.top + rect.height / 2) { before = j; break }
    }
    dropBefore.value = before
  }

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup',   onMouseUp)
    if (activated && dragFrom.value !== null && dropBefore.value !== null) {
      const from     = dragFrom.value
      const before   = dropBefore.value
      const insertAt = from < before ? before - 1 : before
      if (from !== insertAt) {
        plStore.reorderTrack(playlist.value.id, from, insertAt)
      }
    }
    dragFrom.value   = null
    dropBefore.value = null
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup',   onMouseUp)
}

onUnmounted(() => {
  dragFrom.value   = null
  dropBefore.value = null
})
</script>

<template>
  <div v-if="playlist" class="playlist-view">
    <!-- Header -->
    <div class="pl-header">
      <div class="pl-art">♫</div>
      <div class="pl-info">
        <p class="pl-eyebrow">Playlist</p>
        <div class="pl-name-wrap">
          <h1 v-if="!isEditing" class="pl-title" @dblclick="startEdit">{{ playlist.name }}</h1>
          <input
            v-else
            v-model="editName"
            class="pl-name-input"
            autofocus
            @blur="saveEdit"
            @keydown.enter="saveEdit"
            @keydown.esc="isEditing = false"
          />
        </div>
        <p class="pl-meta">{{ playlist.tracks.length }} tracks</p>

        <div v-if="playlist.tracks.length" class="pl-actions">
          <button class="play-btn" @click="playAll()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Play
          </button>
          <button class="shuffle-btn" @click="shufflePlay">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 3 21 3 21 8"/>
              <line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/>
              <line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
            Shuffle
          </button>
          <button class="edit-btn" @click="startEdit">Rename</button>
        </div>
      </div>
    </div>

    <!-- Track list -->
    <EmptyState
      v-if="!playlist.tracks.length"
      icon="♫"
      title="Empty playlist"
      message="Add tracks by clicking ··· on any track"
    />

    <div v-else class="tracks">
      <!-- Column headers -->
      <div class="tracks-header">
        <span></span>
        <span class="col-label">Title</span>
        <span class="col-label">Artist</span>
        <span class="col-label">Album</span>
        <span class="col-label">Duration</span>
        <span></span>
      </div>
      <div class="tracks-divider" />
      <div
        v-for="(track, i) in playlist.tracks"
        :key="track.Id"
        :ref="el => setRowEl(el, i)"
        class="draggable-row"
        :class="{ 'is-dragging-item': isDragging && dragFrom === i }"
        @mousedown="e => startDrag(e, i)"
      >
        <div v-if="isDragging && dropBefore === i" class="drop-line" />
        <TrackRow
          :track="track"
          :index="i"
          :queue="playlist.tracks"
          :table-layout="true"
        />
        <button
          class="remove-btn"
          title="Remove"
          @click.stop="plStore.removeFromPlaylist(playlist.id, track.Id)"
        >
          ✕
        </button>
      </div>
      <div v-if="isDragging && dropBefore === playlist.tracks.length" class="drop-line drop-line--tail" />
    </div>

    <!-- Drag ghost -->
    <Teleport to="body">
      <div
        v-if="isDragging"
        class="drag-ghost"
        :style="{ left: dragPos.x + 'px', top: dragPos.y + 'px' }"
      >
        {{ playlist.tracks[dragFrom]?.Name }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.playlist-view {
  padding: var(--space-2xl);
  width: 100%;
  box-sizing: border-box;
}

.pl-header {
  display: flex;
  gap: var(--space-2xl);
  align-items: flex-end;
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-2xl);
}

.pl-art {
  width: 180px;
  height: 180px;
  border-radius: var(--border-radius-lg);
  background: linear-gradient(135deg, var(--color-surface-alt) 0%, var(--color-border) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: var(--color-accent);
  opacity: 0.8;
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;
}

.pl-eyebrow {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: var(--space-xs);
}

.pl-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.1;
  cursor: text;
}

.pl-name-input {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--color-accent);
  outline: none;
  width: 100%;
}

.pl-meta {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.pl-actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.play-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: var(--border-radius-full);
  font-size: var(--text-base);
  font-weight: 600;
  transition: background var(--duration-base), box-shadow var(--duration-base);
}

.play-btn:hover {
  background: var(--color-accent-soft);
  box-shadow: var(--shadow-glow);
}

.shuffle-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-xl);
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full);
  font-size: var(--text-base);
  font-weight: 500;
  transition: color var(--duration-base), border-color var(--duration-base), box-shadow var(--duration-base);
}

.shuffle-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}

.edit-btn {
  padding: var(--space-sm) var(--space-xl);
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full);
  font-size: var(--text-base);
  font-weight: 500;
  transition: color var(--duration-base), border-color var(--duration-base);
}

.edit-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-accent);
}

/* Track rows */
.tracks {
  position: relative;
}

.tracks-header {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr auto auto;
  gap: var(--space-md);
  padding: 0 var(--space-md) var(--space-sm);
  padding-right: calc(var(--space-md) + 28px); /* account for remove button */
  align-items: center;
}

.col-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tracks-divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: var(--space-sm);
}

.draggable-row {
  position: relative;
  display: flex;
  align-items: center;
  cursor: grab;
  user-select: none;
}

.draggable-row:active { cursor: grabbing; }

.draggable-row.is-dragging-item {
  opacity: 0.3;
}

.draggable-row > :first-child {
  flex: 1;
  min-width: 0;
}

.remove-btn {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  padding: var(--space-xs);
  border-radius: var(--border-radius-sm);
  opacity: 0;
  transition: opacity var(--duration-base), color var(--duration-base);
  flex-shrink: 0;
}

.draggable-row:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: #e07060;
}

/* Drop indicator */
.drop-line {
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 0 6px var(--color-accent);
}

.drop-line--tail {
  position: relative;
  top: 0;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
  pointer-events: none;
  box-shadow: 0 0 6px var(--color-accent);
}

/* Ghost */
.drag-ghost {
  position: fixed;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-accent);
  border-radius: var(--border-radius);
  padding: var(--space-xs) var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-lg);
  white-space: nowrap;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.92;
}
</style>
