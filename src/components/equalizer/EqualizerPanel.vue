<script setup>
import { useEqualizerStore } from '@/stores/equalizer'
import { useAudio } from '@/composables/useAudio'
import EQBandSlider from './EQBandSlider.vue'
import EQPresets from './EQPresets.vue'

const emit   = defineEmits(['close'])
const eqStore = useEqualizerStore()
const audio   = useAudio()

function onBandChange(index, value) {
  eqStore.setBand(index, value)
  audio.updateEQBand(index, value)
}

const FREQ_LABELS = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k']
</script>

<template>
  <div class="eq-panel">
    <div class="eq-header">
      <span class="eq-title">Equalizer</span>
      <EQPresets />
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>

    <div class="eq-bands">
      <EQBandSlider
        v-for="(freq, i) in eqStore.frequencies"
        :key="freq"
        :label="FREQ_LABELS[i]"
        :value="eqStore.bands[i]"
        @change="onBandChange(i, $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.eq-panel {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
  padding: var(--space-lg) var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.eq-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.eq-title {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: 0.05em;
  margin-right: auto;
}

.close-btn {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  padding: var(--space-xs);
  border-radius: var(--border-radius-sm);
  transition: color var(--duration-base);
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.eq-bands {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  justify-content: center;
  padding: var(--space-xs) 0;
}
</style>
