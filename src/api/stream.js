import { useAuthStore } from '@/stores/auth'

export function getStreamUrl(itemId) {
  const auth = useAuthStore()
  return `${auth.serverUrl}/Audio/${itemId}/stream?static=true&api_key=${auth.token}`
}

export function getAlbumArtUrl(itemId, maxWidth = 400) {
  const auth = useAuthStore()
  if (!itemId) return null
  return `${auth.serverUrl}/Items/${itemId}/Images/Primary?maxWidth=${maxWidth}&quality=90`
}

export function getImageUrl(itemId, type = 'Primary', maxWidth = 400) {
  const auth = useAuthStore()
  if (!itemId) return null
  return `${auth.serverUrl}/Items/${itemId}/Images/${type}?maxWidth=${maxWidth}&quality=90`
}

/** Convert Jellyfin ticks (100-nanosecond intervals) → "m:ss" */
export function formatDuration(ticks) {
  if (!ticks) return '0:00'
  const totalSec = Math.floor(ticks / 10_000_000)
  const minutes  = Math.floor(totalSec / 60)
  const seconds  = totalSec % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Format seconds → "m:ss" */
export function formatSeconds(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
