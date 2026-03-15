<script setup>
import { ref, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { getAlbumArtUrl, formatDuration } from '@/api/stream'

const emit   = defineEmits(['close'])
const player = usePlayerStore()

// ── Helpers ────────────────────────────────────────────────────────────────
function artUrl(track) {
  return getAlbumArtUrl(track.AlbumId || track.Id, 56)
}
function dur(track) {
  return formatDuration(track.RunTimeTicks)
}

// ── Drag-to-reorder ────────────────────────────────────────────────────────
const rowEls     = ref([])       // element refs indexed by queue position
const dragFrom   = ref(null)     // index being dragged
const dropBefore = ref(null)     // insert-before index (0..queue.length)
const ghostY     = ref(0)
const ghostX     = ref(0)
const ghostTrack = ref(null)

function setRowRef(el, i) {
  if (el) rowEls.value[i] = el
}

function startDrag(e, index) {
  e.preventDefault()
  dragFrom.value   = index
  dropBefore.value = index
  ghostTrack.value = player.queue[index]
  ghostX.value     = e.clientX + 12
  ghostY.value     = e.clientY - 16

  function onMove(e) {
    ghostX.value = e.clientX + 12
    ghostY.value = e.clientY - 16

    // Determine dropBefore from mouse Y vs row rects
    const rows = rowEls.value
    let found  = false
    for (let i = 0; i < rows.length; i++) {
      const el = rows[i]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (e.clientY < rect.top + rect.height / 2) {
        dropBefore.value = i
        found = true
        break
      }
    }
    if (!found) dropBefore.value = player.queue.length
  }

  function onUp() {
    const from   = dragFrom.value
    const before = dropBefore.value
    if (from !== null && before !== null && before !== from && before !== from + 1) {
      const insertAt = from < before ? before - 1 : before
      player.moveInQueue(from, insertAt)
    }
    dragFrom.value   = null
    dropBefore.value = null
    ghostTrack.value = null
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup',   onUp)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup',   onUp)
}

onUnmounted(() => {
  dragFrom.value   = null
  dropBefore.value = null
  ghostTrack.value = null
})
</script>

<template>
  <div class="queue-panel">
    <!-- Header -->
    <div class="queue-header">
      <span class="queue-title">Queue</span>
      <span class="queue-count">{{ player.queue.length }} tracks</span>
      <button
        v-if="player.queue.length > 1"
        class="text-btn"
        @click="player.clearQueue()"
      >Clear</button>
      <button class="icon-btn" title="Close" @click="emit('close')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Track list -->
    <div class="queue-body" :class="{ 'is-dragging': dragFrom !== null }">
      <template v-for="(track, i) in player.queue" :key="track.Id + '-' + i">
        <!-- Drop line above this row -->
        <div
          v-if="dropBefore === i && dragFrom !== null && dragFrom !== i && dragFrom !== i - 1"
          class="drop-line"
        />

        <div
          :ref="el => setRowRef(el, i)"
          class="queue-row"
          :class="{
            'is-current':  i === player.queueIndex,
            'is-history':  i < player.queueIndex,
            'is-dragging-item': dragFrom === i,
          }"
          @click="dragFrom === null && i !== player.queueIndex && player.jumpToIndex(i)"
        >
          <!-- Drag handle -->
          <div
            class="drag-handle"
            title="Drag to reorder"
            @mousedown="startDrag($event, i)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
              <circle cx="9"  cy="5"  r="1.5"/>
              <circle cx="15" cy="5"  r="1.5"/>
              <circle cx="9"  cy="12" r="1.5"/>
              <circle cx="15" cy="12" r="1.5"/>
              <circle cx="9"  cy="19" r="1.5"/>
              <circle cx="15" cy="19" r="1.5"/>
            </svg>
          </div>

          <!-- Art -->
          <div class="row-art">
            <img v-if="artUrl(track)" :src="artUrl(track)" :alt="track.Album" draggable="false" />
            <div v-else class="art-fallback">♪</div>
            <!-- playing bars overlay -->
            <div v-if="i === player.queueIndex && player.isPlaying" class="playing-overlay">
              <svg width="10" height="10" viewBox="0 0 12 12">
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
            </div>
          </div>

          <!-- Info -->
          <div class="row-info">
            <span class="row-name">{{ track.Name }}</span>
            <span class="row-artist">{{ track.AlbumArtist || track.Artists?.[0] }}</span>
          </div>

          <!-- Duration -->
          <span class="row-dur">{{ dur(track) }}</span>

          <!-- Remove -->
          <button
            v-if="i !== player.queueIndex"
            class="remove-btn"
            title="Remove"
            @click.stop="player.removeFromQueue(i)"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <span v-else class="row-spacer" />
        </div>
      </template>

      <!-- Drop line at end -->
      <div
        v-if="dropBefore === player.queue.length && dragFrom !== null && dragFrom !== player.queue.length - 1"
        class="drop-line"
      />

      <div v-if="!player.queue.length" class="empty">Queue is empty</div>
    </div>
  </div>

  <!-- Drag ghost -->
  <Teleport to="body">
    <div
      v-if="ghostTrack"
      class="drag-ghost"
      :style="{ top: ghostY + 'px', left: ghostX + 'px' }"
    >
      <span class="ghost-name">{{ ghostTrack.Name }}</span>
      <span class="ghost-artist">{{ ghostTrack.AlbumArtist || ghostTrack.Artists?.[0] }}</span>
    </div>
  </Teleport>
</template>

<style scoped>
.queue-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: var(--sidebar-width);
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
}

/* ── Header ── */
.queue-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-lg);
  height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.queue-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: 0.03em;
}

.queue-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-right: auto;
}

.text-btn {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  padding: 3px var(--space-sm);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border);
  transition: color var(--duration-base), border-color var(--duration-base);
}
.text-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-muted);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  padding: var(--space-xs);
  border-radius: var(--border-radius-sm);
  transition: color var(--duration-base);
}
.icon-btn:hover { color: var(--color-text-primary); }

/* ── Body ── */
.queue-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm) 0;
}

.queue-body.is-dragging {
  cursor: grabbing;
  user-select: none;
}

/* ── Drop line ── */
.drop-line {
  height: 2px;
  background: var(--color-accent);
  margin: 0 var(--space-lg);
  border-radius: 1px;
  box-shadow: 0 0 6px rgba(201, 169, 110, 0.5);
}

/* ── Row ── */
.queue-row {
  display: grid;
  grid-template-columns: 20px 36px 1fr auto auto;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md) var(--space-xs) var(--space-sm);
  cursor: pointer;
  transition: background var(--duration-fast);
  border-radius: var(--border-radius-sm);
  margin: 0 var(--space-xs);
}

.queue-row:hover {
  background: var(--color-surface-alt);
}
.queue-row:hover .drag-handle svg { opacity: 1 !important; }
.queue-row:hover .remove-btn { opacity: 1; }

.queue-row.is-current {
  cursor: default;
}

.queue-row.is-history {
  opacity: 0.45;
}

.queue-row.is-dragging-item {
  opacity: 0.25;
}

/* ── Drag handle ── */
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--color-text-muted);
}
.drag-handle:active { cursor: grabbing; }

/* ── Art ── */
.row-art {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.row-art img,
.art-fallback {
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
}

.art-fallback {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.playing-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--border-radius-sm);
}

/* ── Info ── */
.row-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.row-name {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.is-current .row-name { color: var(--color-accent); }

.row-artist {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-dur {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* ── Remove btn ── */
.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  padding: 4px;
  border-radius: var(--border-radius-sm);
  opacity: 0;
  transition: opacity var(--duration-fast), color var(--duration-fast);
}
.remove-btn:hover { color: var(--color-text-primary); }

.row-spacer { width: 19px; flex-shrink: 0; }

/* ── Empty ── */
.empty {
  padding: var(--space-2xl) var(--space-lg);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-style: italic;
}
</style>

<!-- Ghost (unscoped, teleported to body) -->
<style>
.drag-ghost {
  position: fixed;
  z-index: 99999;
  pointer-events: none;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-accent);
  border-radius: var(--border-radius);
  padding: 6px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 200px;
}
.drag-ghost .ghost-name {
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.drag-ghost .ghost-artist {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
