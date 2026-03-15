import { usePlayerStore } from '@/stores/player'

export function useQueue() {
  const player = usePlayerStore()

  function playAlbum(tracks, startIndex = 0) {
    if (!tracks.length) return
    player.playTrack(tracks[startIndex], tracks)
  }

  function playTrackInContext(track, tracks) {
    player.playTrack(track, tracks)
  }

  function addToQueue(track) {
    if (!player.queue.find(t => t.Id === track.Id)) {
      player.queue.push(track)
    }
  }

  function addNextInQueue(track) {
    const insertIdx = player.queueIndex + 1
    player.queue.splice(insertIdx, 0, track)
  }

  function removeFromQueue(index) {
    player.queue.splice(index, 1)
    if (index < player.queueIndex) {
      player.queueIndex--
    }
  }

  function clearQueue() {
    player.queue       = []
    player.queueIndex  = 0
  }

  return {
    playAlbum,
    playTrackInContext,
    addToQueue,
    addNextInQueue,
    removeFromQueue,
    clearQueue,
  }
}
