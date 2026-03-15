<script setup>
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
</script>

<template>
  <div class="controls">
    <!-- Shuffle -->
    <button
      class="ctrl-btn ctrl-btn--sm"
      :class="{ active: player.shuffleOn }"
      title="Shuffle (S)"
      @click="player.toggleShuffle()"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 3 21 3 21 8"/>
        <line x1="4" y1="20" x2="21" y2="3"/>
        <polyline points="21 16 21 21 16 21"/>
        <line x1="15" y1="15" x2="21" y2="21"/>
      </svg>
    </button>

    <!-- Prev -->
    <button class="ctrl-btn" title="Previous (←)" @click="player.prev()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="19 20 9 12 19 4 19 20"/>
        <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Play/Pause -->
    <button
      class="ctrl-btn ctrl-btn--play"
      :title="player.isPlaying ? 'Pause (Space)' : 'Play (Space)'"
      @click="player.togglePlay()"
    >
      <svg v-if="!player.isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="7 3 21 12 7 21"/>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16"/>
        <rect x="14" y="4" width="4" height="16"/>
      </svg>
    </button>

    <!-- Next -->
    <button class="ctrl-btn" title="Next (→)" @click="player.next()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 4 15 12 5 20 5 4"/>
        <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Repeat -->
    <button
      class="ctrl-btn ctrl-btn--sm"
      :class="{ active: player.repeatMode !== 'none' }"
      :title="`Repeat: ${player.repeatMode}`"
      @click="player.cycleRepeat()"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="17 1 21 5 17 9"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
      <span v-if="player.repeatMode === 'one'" class="repeat-one">1</span>
    </button>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border-radius: 50%;
  transition: color var(--duration-base) var(--ease-default),
              transform var(--duration-fast) var(--ease-default);
  position: relative;
}

.ctrl-btn:hover {
  color: var(--color-text-primary);
  transform: scale(1.08);
}

.ctrl-btn.active {
  color: var(--color-accent);
}

.ctrl-btn--sm {
  width: 28px;
  height: 28px;
}

.ctrl-btn--play {
  width: 40px;
  height: 40px;
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: 50%;
  transition: transform var(--duration-fast) var(--ease-default),
              box-shadow var(--duration-base) var(--ease-default);
}

.ctrl-btn--play:hover {
  color: var(--color-bg);
  transform: scale(1.08);
  box-shadow: var(--shadow-glow);
}

.repeat-one {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 8px;
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--color-accent);
  background: var(--color-surface);
  border-radius: 2px;
  padding: 0 1px;
  line-height: 1;
}
</style>
