<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useAudio } from '@/composables/useAudio'

const player = usePlayerStore()
const audio  = useAudio()
const canvas = ref(null)
let rafId = null

function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx || !canvas.value) return

  const w   = canvas.value.width
  const h   = canvas.value.height
  const data = audio.getFrequencyData()

  ctx.clearRect(0, 0, w, h)

  if (!data || !player.isPlaying) {
    // Idle flat line
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.2)'
    ctx.lineWidth   = 1
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()
    return
  }

  const barCount = 28
  const step     = Math.floor(data.length / barCount)
  const barW     = w / barCount
  const gap      = 1.5

  for (let i = 0; i < barCount; i++) {
    const val   = data[i * step] / 255
    const barH  = Math.max(2, val * h)
    const x     = i * barW
    const y     = (h - barH) / 2

    const alpha = 0.4 + val * 0.6
    ctx.fillStyle = `rgba(201, 169, 110, ${alpha})`
    ctx.beginPath()
    ctx.roundRect(x + gap / 2, y, barW - gap, barH, 1)
    ctx.fill()
  }

  rafId = requestAnimationFrame(draw)
}

watch(() => player.isPlaying, (playing) => {
  if (playing) {
    rafId = requestAnimationFrame(draw)
  } else {
    cancelAnimationFrame(rafId)
    draw() // draw idle state
  }
})

onMounted(() => {
  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <canvas ref="canvas" width="80" height="32" class="eq-canvas" />
</template>

<style scoped>
.eq-canvas {
  display: block;
  opacity: 0.85;
  transition: opacity var(--duration-slow);
}
</style>
