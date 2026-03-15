import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref(null)
  const queue        = ref([])
  const queueIndex   = ref(0)
  const isPlaying    = ref(false)
  const volume       = ref(0.8)
  const isMuted      = ref(false)
  const shuffleOn    = ref(localStorage.getItem('jp_shuffle') === 'true')
  const repeatMode   = ref(localStorage.getItem('jp_repeat') || 'none')
  const currentTime  = ref(0)
  const duration     = ref(0)

  // Reference to the <audio> element — set by NowPlayingBar on mount
  const audioEl = ref(null)

  const progress = computed(() =>
    duration.value > 0 ? currentTime.value / duration.value : 0
  )

  const currentTrackArt = computed(() => currentTrack.value?.artUrl || null)

  function setAudioElement(el) {
    audioEl.value = el
    if (el) {
      el.volume = volume.value
      el.muted  = isMuted.value
    }
  }

  function playTrack(track, newQueue = null) {
    if (newQueue) queue.value = newQueue
    const idx = queue.value.findIndex(t => t.Id === track.Id)
    queueIndex.value = idx >= 0 ? idx : 0
    if (!newQueue && idx === -1) {
      queue.value = [track]
      queueIndex.value = 0
    }
    currentTrack.value = track
    isPlaying.value    = true
  }

  function togglePlay() {
    if (!currentTrack.value) return
    isPlaying.value = !isPlaying.value
  }

  function next() {
    if (!queue.value.length) return
    if (repeatMode.value === 'one') {
      if (audioEl.value) audioEl.value.currentTime = 0
      return
    }
    if (shuffleOn.value) {
      let idx
      do { idx = Math.floor(Math.random() * queue.value.length) }
      while (idx === queueIndex.value && queue.value.length > 1)
      queueIndex.value = idx
    } else {
      if (repeatMode.value === 'none' && queueIndex.value === queue.value.length - 1) {
        isPlaying.value = false
        return
      }
      queueIndex.value = (queueIndex.value + 1) % queue.value.length
    }
    currentTrack.value = queue.value[queueIndex.value]
    isPlaying.value    = true
  }

  function prev() {
    if (currentTime.value > 3) {
      if (audioEl.value) audioEl.value.currentTime = 0
      return
    }
    if (!queue.value.length) return
    queueIndex.value   = (queueIndex.value - 1 + queue.value.length) % queue.value.length
    currentTrack.value = queue.value[queueIndex.value]
    isPlaying.value    = true
  }

  function seek(time) {
    if (audioEl.value) audioEl.value.currentTime = time
  }

  function setVolume(v) {
    volume.value = Math.max(0, Math.min(1, v))
    if (audioEl.value) audioEl.value.volume = volume.value
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (audioEl.value) audioEl.value.muted = isMuted.value
  }

  function toggleShuffle() {
    shuffleOn.value = !shuffleOn.value
    localStorage.setItem('jp_shuffle', shuffleOn.value)
  }

  function cycleRepeat() {
    const modes = ['none', 'all', 'one']
    const idx = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(idx + 1) % modes.length]
    localStorage.setItem('jp_repeat', repeatMode.value)
  }

  function removeFromQueue(index) {
    if (index === queueIndex.value) return
    queue.value.splice(index, 1)
    if (index < queueIndex.value) queueIndex.value--
  }

  function clearQueue() {
    const current = queue.value[queueIndex.value]
    queue.value = current ? [current] : []
    queueIndex.value = 0
  }

  function jumpToIndex(index) {
    if (index < 0 || index >= queue.value.length) return
    queueIndex.value = index
    currentTrack.value = queue.value[index]
    isPlaying.value = true
  }

  // Move item from fromIndex to insertAt (final position after removal)
  function moveInQueue(fromIndex, insertAt) {
    if (fromIndex === insertAt) return
    const track = queue.value.splice(fromIndex, 1)[0]
    queue.value.splice(insertAt, 0, track)
    const qi = queueIndex.value
    if (qi === fromIndex) {
      queueIndex.value = insertAt
    } else if (fromIndex < insertAt) {
      if (qi > fromIndex && qi <= insertAt) queueIndex.value = qi - 1
    } else {
      if (qi >= insertAt && qi < fromIndex) queueIndex.value = qi + 1
    }
  }

  function setTime(t)     { currentTime.value = t }
  function setDuration(d) { duration.value = d }
  function setPlaying(v)  { isPlaying.value = v }

  return {
    currentTrack, queue, queueIndex, isPlaying, volume, isMuted,
    shuffleOn, repeatMode, currentTime, duration, progress,
    currentTrackArt, audioEl,
    setAudioElement, playTrack, togglePlay, next, prev, seek,
    setVolume, toggleMute, toggleShuffle, cycleRepeat,
    setTime, setDuration, setPlaying,
    removeFromQueue, clearQueue, jumpToIndex, moveInQueue,
  }
})
