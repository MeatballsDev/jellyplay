<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: { type: Number, default: 0 },
})

const emit = defineEmits(['change'])

const displayVal = computed(() => {
  const v = props.value
  return v === 0 ? '0' : v > 0 ? `+${v}` : String(v)
})

function onInput(e) {
  emit('change', Number(e.target.value))
}
</script>

<template>
  <div class="band">
    <span class="db-val" :class="{ positive: value > 0, negative: value < 0 }">
      {{ displayVal }}
    </span>

    <div class="slider-wrap">
      <input
        class="slider"
        type="range"
        min="-12"
        max="12"
        step="0.5"
        :value="value"
        @input="onInput"
      />
      <div class="zero-line" />
    </div>

    <span class="freq-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.band {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.db-val {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-text-muted);
  min-width: 28px;
  text-align: center;
  line-height: 1;
  transition: color var(--duration-base);
}
.db-val.positive { color: var(--color-accent); }

.slider-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Vertical slider */
.slider {
  -webkit-appearance: none;
  appearance: none;
  writing-mode: vertical-lr;
  direction: rtl;
  width: 4px;
  height: 80px;
  background: transparent;
  outline: none;
  cursor: pointer;
  accent-color: var(--color-accent);
}

/* Track */
.slider::-webkit-slider-runnable-track {
  width: 4px;
  background: var(--color-border);
  border-radius: 2px;
}
.slider::-moz-range-track {
  width: 4px;
  background: var(--color-border);
  border-radius: 2px;
}

/* Thumb */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-accent);
  border: 2px solid var(--color-bg);
  box-shadow: 0 0 0 1px var(--color-accent), 0 2px 6px rgba(0,0,0,0.5);
  margin-left: -5px;
  transition: box-shadow var(--duration-base), transform var(--duration-fast);
  cursor: grab;
}
.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-accent);
  border: 2px solid var(--color-bg);
  box-shadow: 0 0 0 1px var(--color-accent), 0 2px 6px rgba(0,0,0,0.5);
  cursor: grab;
}

.slider:hover::-webkit-slider-thumb {
  box-shadow: 0 0 0 1px var(--color-accent), 0 0 10px rgba(201,169,110,0.4), 0 2px 6px rgba(0,0,0,0.5);
  transform: scale(1.15);
}
.slider:active::-webkit-slider-thumb {
  cursor: grabbing;
  transform: scale(1.1);
}

/* Zero centre marker */
.zero-line {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 1px;
  background: var(--color-text-muted);
  opacity: 0.4;
  pointer-events: none;
}

.freq-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-text-muted);
  text-align: center;
  min-width: 28px;
  line-height: 1;
}
</style>
