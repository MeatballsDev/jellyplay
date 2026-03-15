<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { formatSeconds } from '@/api/stream'

const player = usePlayerStore()

const isDragging = ref(false)
const hoverTime  = ref(null)
const hoverX     = ref(0)
const trackEl    = ref(null)

const progressPct = computed(() => `${player.progress * 100}%`)

function getTimeFromEvent(e) {
  if (!trackEl.value) return 0
  const rect   = trackEl.value.getBoundingClientRect()
  const ratio  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  return ratio * player.duration
}

function onMouseMove(e) {
  hoverTime.value = getTimeFromEvent(e)
  hoverX.value    = e.clientX - trackEl.value.getBoundingClientRect().left
  if (isDragging.value) {
    player.seek(hoverTime.value)
  }
}

function onMouseDown(e) {
  isDragging.value = true
  player.seek(getTimeFromEvent(e))
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup',   onDragEnd)
}

function onDragMove(e) {
  if (!isDragging.value) return
  player.seek(getTimeFromEvent(e))
}

function onDragEnd() {
  isDragging.value = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup',   onDragEnd)
}

function onMouseLeave() {
  hoverTime.value = null
}
</script>

<template>
  <div class="progress-wrap">
    <span class="time">{{ formatSeconds(player.currentTime) }}</span>

    <div
      ref="trackEl"
      class="track"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      @mousedown="onMouseDown"
    >
      <div class="track-bg">
        <div class="track-fill" :style="{ width: progressPct }" />
        <div class="track-thumb" :style="{ left: progressPct }" />
      </div>

      <!-- Hover tooltip -->
      <div
        v-if="hoverTime !== null"
        class="hover-tooltip"
        :style="{ left: hoverX + 'px' }"
      >
        {{ formatSeconds(hoverTime) }}
      </div>
    </div>

    <span class="time">{{ formatSeconds(player.duration) }}</span>
  </div>
</template>

<style scoped>
.progress-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  max-width: 480px;
}

.time {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  width: 32px;
  flex-shrink: 0;
  text-align: center;
}

.track {
  flex: 1;
  height: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.track-bg {
  width: 100%;
  height: 3px;
  background: var(--color-surface-alt);
  border-radius: var(--border-radius-full);
  position: relative;
  transition: height var(--duration-base) var(--ease-default);
}

.track:hover .track-bg {
  height: 4px;
}

.track-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--border-radius-full);
  transition: width 0.1s linear;
}

.track-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: var(--shadow-glow);
  transition: transform var(--duration-base) var(--ease-default),
              left 0.1s linear;
}

.track:hover .track-thumb {
  transform: translate(-50%, -50%) scale(1);
}

.hover-tooltip {
  position: absolute;
  top: -28px;
  transform: translateX(-50%);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  pointer-events: none;
  white-space: nowrap;
}
</style>
