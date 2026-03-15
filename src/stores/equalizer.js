import { defineStore } from 'pinia'
import { ref } from 'vue'

export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

export const EQ_PRESETS = {
  flat:       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bassBoost:  [7, 6, 4, 2, 0, 0, 0, 0, 0, 0],
  treble:     [0, 0, 0, 0, 0, 0, 2, 4, 5, 6],
  vocal:      [-2, -1, 0, 2, 4, 4, 3, 1, 0, -1],
  classical:  [4, 3, 2, 0, 0, 0, 0, 2, 3, 4],
  electronic: [4, 3, 0, -2, -1, 2, 0, 2, 3, 4],
  rock:       [4, 2, 0, -1, -1, 0, 2, 3, 3, 3],
  jazz:       [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
}

export const useEqualizerStore = defineStore('equalizer', () => {
  const bands       = ref(JSON.parse(localStorage.getItem('jp_eq_bands') || 'null') || [...EQ_PRESETS.flat])
  const activePreset = ref(localStorage.getItem('jp_eq_preset') || 'flat')
  const isEnabled   = ref(true)

  function persist() {
    localStorage.setItem('jp_eq_bands',  JSON.stringify(bands.value))
    localStorage.setItem('jp_eq_preset', activePreset.value)
  }

  function setBand(index, value) {
    bands.value[index] = value
    activePreset.value  = 'custom'
    persist()
  }

  function applyPreset(name) {
    if (!EQ_PRESETS[name]) return
    bands.value       = [...EQ_PRESETS[name]]
    activePreset.value = name
    persist()
  }

  function reset() {
    applyPreset('flat')
  }

  return {
    bands, activePreset, isEnabled,
    frequencies: EQ_FREQUENCIES,
    presets: EQ_PRESETS,
    setBand, applyPreset, reset,
  }
})
