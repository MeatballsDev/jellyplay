import { ref, watch } from 'vue'
import { useEqualizerStore } from '@/stores/equalizer'

// Singleton audio graph — one context for the lifetime of the app
let audioCtx     = null
let sourceNode   = null
let eqNodes      = []
let analyserNode = null
let gainNode     = null
let initialized  = false

const isReady = ref(false)

export function useAudio() {
  const eqStore = useEqualizerStore()

  /**
   * Connect the <audio> element to the Web Audio graph.
   * Must be called once, after a user gesture (to satisfy browser autoplay policy).
   */
  function initAudioContext(audioElement) {
    if (initialized) return
    initialized = true

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.error('[useAudio] Failed to create AudioContext:', e)
      initialized = false
      return
    }

    try {
      sourceNode = audioCtx.createMediaElementSource(audioElement)
    } catch (e) {
      console.error('[useAudio] createMediaElementSource failed:', e)
      // Audio element may already be connected — still resume context
      audioCtx.resume().catch(() => {})
      return
    }

    // 10-band peaking EQ
    eqNodes = eqStore.frequencies.map((freq, i) => {
      const filter = audioCtx.createBiquadFilter()
      filter.type           = 'peaking'
      filter.frequency.value = freq
      filter.Q.value         = 1.4
      filter.gain.value      = eqStore.bands[i]
      return filter
    })

    // Analyser for visualizer
    analyserNode = audioCtx.createAnalyser()
    analyserNode.fftSize              = 256
    analyserNode.smoothingTimeConstant = 0.8

    // Output gain
    gainNode = audioCtx.createGain()
    gainNode.gain.value = 1

    // Chain: source → eq[0..9] → analyser → gain → destination
    let prev = sourceNode
    for (const node of eqNodes) {
      prev.connect(node)
      prev = node
    }
    prev.connect(analyserNode)
    analyserNode.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    isReady.value = true

    // Resume immediately — AudioContext starts suspended when created outside
    // a direct user-gesture handler (e.g. from onLoadedMetadata)
    audioCtx.resume().catch(() => {})
  }

  function resumeContext() {
    if (audioCtx?.state === 'suspended') {
      audioCtx.resume()
    }
  }

  function updateEQBand(index, value) {
    if (eqNodes[index]) {
      eqNodes[index].gain.value = value
    }
  }

  function updateAllBands(bands) {
    bands.forEach((v, i) => {
      if (eqNodes[i]) eqNodes[i].gain.value = v
    })
  }

  function getAnalyserNode() {
    return analyserNode
  }

  function getFrequencyData() {
    if (!analyserNode) return null
    const data = new Uint8Array(analyserNode.frequencyBinCount)
    analyserNode.getByteFrequencyData(data)
    return data
  }

  function getTimeDomainData() {
    if (!analyserNode) return null
    const data = new Uint8Array(analyserNode.fftSize)
    analyserNode.getByteTimeDomainData(data)
    return data
  }

  // Keep EQ nodes in sync when store bands change
  watch(() => eqStore.bands, (bands) => {
    if (isReady.value) updateAllBands(bands)
  }, { deep: true })

  return {
    isReady,
    initAudioContext,
    resumeContext,
    updateEQBand,
    updateAllBands,
    getAnalyserNode,
    getFrequencyData,
    getTimeDomainData,
  }
}
