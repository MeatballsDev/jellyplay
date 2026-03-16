<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useAudio } from '@/composables/useAudio'
import { getAlbumArtUrl } from '@/api/stream'
import PlaybackControls from '@/components/player/PlaybackControls.vue'
import ProgressBar from '@/components/player/ProgressBar.vue'
import VolumeControl from '@/components/player/VolumeControl.vue'

const emit = defineEmits(['close'])

const player = usePlayerStore()
const audio  = useAudio()

const canvasEl = ref(null)
let rafId = null

const artUrl = computed(() => {
  if (!player.currentTrack) return null
  const id = player.currentTrack.AlbumId || player.currentTrack.Id
  return getAlbumArtUrl(id, 800)
})

const title  = computed(() => player.currentTrack?.Name || '')
const artist = computed(() => player.currentTrack?.AlbumArtist || player.currentTrack?.Artists?.[0] || '')
const album  = computed(() => player.currentTrack?.Album || '')

// ─── Waveform canvas ────────────────────────────────────────────────────────

function draw() {
  const canvas = canvasEl.value
  if (!canvas) return

  const W    = canvas.width
  const H    = canvas.height
  const ctx  = canvas.getContext('2d')
  const data = audio.getTimeDomainData()

  ctx.clearRect(0, 0, W, H)

  if (!data || !player.isPlaying) {
    // Idle: thin flat line
    ctx.beginPath()
    ctx.moveTo(0, H / 2)
    ctx.lineTo(W, H / 2)
    ctx.strokeStyle = 'rgba(201,169,110,0.2)'
    ctx.lineWidth   = 1.5
    ctx.stroke()
    return
  }

  const sliceW    = W / (data.length - 1)
  const amplitude = H / 2 * 0.85

  // Build top (above centre) and bottom (mirror) boundaries
  const topPts = []
  const botPts = []
  for (let i = 0; i < data.length; i++) {
    const dev = Math.abs(data[i] - 128) / 128  // 0…1
    const x   = i * sliceW
    topPts.push([x, H / 2 - dev * amplitude])
    botPts.push([x, H / 2 + dev * amplitude])
  }

  // Filled shape between top and bottom
  ctx.beginPath()
  topPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
  for (let i = botPts.length - 1; i >= 0; i--) {
    ctx.lineTo(botPts[i][0], botPts[i][1])
  }
  ctx.closePath()

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0,    'rgba(201,169,110,0.18)')
  grad.addColorStop(0.5,  'rgba(201,169,110,0.06)')
  grad.addColorStop(1,    'rgba(201,169,110,0.18)')
  ctx.fillStyle = grad
  ctx.fill()

  // Glow stroke — top boundary
  ctx.beginPath()
  topPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
  ctx.strokeStyle = 'rgba(201,169,110,0.9)'
  ctx.lineWidth   = 1.5
  ctx.lineJoin    = 'round'
  ctx.shadowColor = 'rgba(201,169,110,0.8)'
  ctx.shadowBlur  = 8
  ctx.stroke()

  // Glow stroke — bottom boundary
  ctx.beginPath()
  botPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
  ctx.stroke()

  ctx.shadowBlur = 0

  rafId = requestAnimationFrame(draw)
}

watch(() => player.isPlaying, (playing) => {
  cancelAnimationFrame(rafId)
  if (playing) {
    rafId = requestAnimationFrame(draw)
  } else {
    draw() // render idle state
  }
})

// ─── Keyboard ───────────────────────────────────────────────────────────────

function onKeyDown(e) {
  // Escape is handled via fullscreenchange (browser exits FS first, then we close)
  if (e.key === 'Escape' && !document.fullscreenElement) emit('close')
}

function onFullscreenChange() {
  // If the user exited fullscreen (F11 or Esc in native FS), close the overlay
  if (!document.fullscreenElement) emit('close')
}

onMounted(() => {
  draw()
  if (player.isPlaying) rafId = requestAnimationFrame(draw)
  window.addEventListener('keydown', onKeyDown)
  document.documentElement.requestFullscreen?.().catch(() => {})
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
})
</script>

<template>
  <div class="np-overlay" @click.self="emit('close')">

    <!-- Blurred album art background -->
    <div class="np-bg">
      <img v-if="artUrl" :src="artUrl" class="np-bg-art" alt="" />
      <div class="np-bg-tint" />
    </div>

    <!-- Close button -->
    <button class="np-close" title="Close (Esc)" @click="emit('close')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6"  x2="6"  y2="18"/>
        <line x1="6"  y1="6"  x2="18" y2="18"/>
      </svg>
    </button>

    <!-- Main content -->
    <div class="np-content">

      <!-- Album art -->
      <div class="np-art-wrap">
        <img v-if="artUrl" :src="artUrl" class="np-art" :alt="album" />
        <div v-else class="np-art-placeholder">♪</div>
      </div>

      <!-- Track info -->
      <div class="np-info">
        <div class="np-title">{{ title || 'Nothing playing' }}</div>
        <div class="np-artist">{{ artist }}</div>
        <div v-if="album" class="np-album">{{ album }}</div>
      </div>

      <!-- Waveform visualizer -->
      <div class="np-visualizer">
        <canvas ref="canvasEl" width="1200" height="160" class="np-canvas" />
      </div>

      <!-- Progress -->
      <div class="np-progress">
        <ProgressBar />
      </div>

      <!-- Controls + Volume -->
      <div class="np-controls">
        <PlaybackControls />
        <div class="np-volume">
          <VolumeControl />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.np-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ── Background ── */
.np-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.np-bg-art {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(72px) saturate(1.6) brightness(0.28);
  transform: scale(1.12); /* hide blur edges */
  display: block;
}

.np-bg-tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(26, 18, 9, 0.55) 0%,
    rgba(26, 18, 9, 0.40) 50%,
    rgba(26, 18, 9, 0.65) 100%
  );
}

/* ── Close ── */
.np-close {
  position: absolute;
  top: var(--space-xl);
  right: var(--space-xl);
  z-index: 1;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--duration-base), color var(--duration-base);
}

.np-close:hover {
  background: rgba(255, 255, 255, 0.13);
  color: var(--color-text-primary);
}

/* ── Content column ── */
.np-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xl);
  width: 100%;
  max-width: 620px;
  padding: var(--space-3xl) var(--space-xl) var(--space-2xl);
}

/* ── Album art ── */
.np-art-wrap {
  flex-shrink: 0;
}

.np-art {
  width: 260px;
  height: 260px;
  border-radius: var(--border-radius-lg);
  object-fit: cover;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.75),
    0 0   48px rgba(201, 169, 110, 0.12);
}

.np-art-placeholder {
  width: 260px;
  height: 260px;
  border-radius: var(--border-radius-lg);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Track info ── */
.np-info {
  text-align: center;
  min-width: 0;
  width: 100%;
}

.np-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.np-artist {
  font-size: var(--text-base);
  color: var(--color-accent);
  margin-bottom: 2px;
}

.np-album {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* ── Waveform ── */
.np-visualizer {
  width: 100%;
  height: 72px;
}

.np-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* ── Progress ── */
.np-progress {
  width: 100%;
}

.np-progress :deep(.progress-wrap) {
  max-width: 100%;
}

.np-progress :deep(.track-bg) {
  height: 5px;
}

.np-progress :deep(.track:hover .track-bg) {
  height: 6px;
}

.np-progress :deep(.track-thumb) {
  width: 14px;
  height: 14px;
}

/* ── Controls ── */
.np-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.np-volume {
  opacity: 0.75;
  transition: opacity var(--duration-base);
}

.np-volume:hover {
  opacity: 1;
}
</style>
