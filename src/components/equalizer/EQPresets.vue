<script setup>
import { useEqualizerStore } from '@/stores/equalizer'
import { useAudio } from '@/composables/useAudio'

const eqStore = useEqualizerStore()
const audio   = useAudio()

const presetNames = {
  flat:       'Flat',
  bassBoost:  'Bass',
  treble:     'Treble',
  vocal:      'Vocal',
  classical:  'Classical',
  electronic: 'Electronic',
  rock:       'Rock',
  jazz:       'Jazz',
}

function select(key) {
  eqStore.applyPreset(key)
  audio.updateAllBands(eqStore.bands)
}
</script>

<template>
  <div class="presets">
    <button
      v-for="(label, key) in presetNames"
      :key="key"
      class="preset-pill"
      :class="{ active: eqStore.activePreset === key }"
      @click="select(key)"
    >
      {{ label }}
    </button>
    <button
      v-if="eqStore.activePreset === 'custom'"
      class="preset-pill active custom"
      disabled
    >
      Custom
    </button>
  </div>
</template>

<style scoped>
.presets {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.preset-pill {
  padding: 3px 10px;
  border-radius: var(--border-radius-full);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  transition: color var(--duration-base), background var(--duration-base),
              border-color var(--duration-base);
  white-space: nowrap;
}

.preset-pill:hover:not(:disabled) {
  color: var(--color-text-primary);
  border-color: var(--color-accent);
}

.preset-pill.active {
  background: var(--color-accent-dim);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.preset-pill.custom {
  cursor: default;
  border-style: dashed;
}
</style>
