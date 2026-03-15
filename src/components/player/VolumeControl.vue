<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()

const volumeState = computed(() => {
  if (player.isMuted || player.volume === 0) return 'muted'
  if (player.volume < 0.5) return 'low'
  return 'high'
})

function onInput(e) {
  player.setVolume(Number(e.target.value))
}
</script>

<template>
  <div class="volume">
    <button
      class="mute-btn"
      :title="player.isMuted ? 'Unmute (M)' : 'Mute (M)'"
      @click="player.toggleMute()"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <!-- Speaker cone — always present -->
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>

        <!-- Muted: cross -->
        <template v-if="volumeState === 'muted'">
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </template>

        <!-- Low: one small arc -->
        <template v-else-if="volumeState === 'low'">
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </template>

        <!-- High: two arcs -->
        <template v-else>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </template>
      </svg>
    </button>

    <input
      type="range"
      class="volume-slider"
      min="0"
      max="1"
      step="0.01"
      :value="player.isMuted ? 0 : player.volume"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.volume {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.mute-btn {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--duration-base);
  flex-shrink: 0;
}

.mute-btn:hover {
  color: var(--color-text-primary);
}

.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  accent-color: var(--color-accent);
  width: 80px;
  height: 3px;
  background: var(--color-surface-alt);
  border-radius: var(--border-radius-full);
  outline: none;
  cursor: pointer;
  transition: height var(--duration-base);
}

.volume-slider:hover {
  height: 4px;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  transition: transform var(--duration-fast);
  box-shadow: var(--shadow-glow);
}

.volume-slider:hover::-webkit-slider-thumb {
  transform: scale(1.2);
}

.volume-slider::-webkit-slider-runnable-track {
  height: 3px;
  border-radius: var(--border-radius-full);
}
</style>
