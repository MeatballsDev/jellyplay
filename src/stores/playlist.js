import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getJellyfinPlaylists,
  getJellyfinPlaylistItems,
  createJellyfinPlaylist,
  addToJellyfinPlaylist,
  removeFromJellyfinPlaylist,
  moveJellyfinPlaylistItem,
  deleteJellyfinPlaylist,
  renameJellyfinPlaylist,
} from '@/api/playlists'

export const usePlaylistStore = defineStore('playlist', () => {
  const playlists = ref([])
  const isLoading = ref(false)

  async function loadPlaylists() {
    isLoading.value = true
    try {
      const jfPlaylists = await getJellyfinPlaylists()
      const loaded = await Promise.all(
        jfPlaylists.map(async (pl) => {
          const items = await getJellyfinPlaylistItems(pl.Id)
          return {
            id:       pl.Id,
            name:     pl.Name,
            tracks:   items,
            trackIds: items.map(t => t.Id),
          }
        })
      )
      playlists.value = loaded
    } catch (e) {
      console.error('[playlist] loadPlaylists failed:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function createPlaylist(name) {
    const data = await createJellyfinPlaylist(name, [])
    const playlist = {
      id:       data.Id,
      name,
      tracks:   [],
      trackIds: [],
    }
    playlists.value.push(playlist)
    return playlist
  }

  async function addToPlaylist(playlistId, track) {
    const pl = playlists.value.find(p => p.id === playlistId)
    if (!pl || pl.trackIds.includes(track.Id)) return
    await addToJellyfinPlaylist(playlistId, [track.Id])
    // Re-fetch to get PlaylistItemId for each track (needed for removal)
    const items = await getJellyfinPlaylistItems(playlistId)
    pl.tracks   = items
    pl.trackIds = items.map(t => t.Id)
  }

  async function removeFromPlaylist(playlistId, trackId) {
    const pl = playlists.value.find(p => p.id === playlistId)
    if (!pl) return
    const track = pl.tracks.find(t => t.Id === trackId)
    if (!track?.PlaylistItemId) return
    await removeFromJellyfinPlaylist(playlistId, [track.PlaylistItemId])
    pl.tracks   = pl.tracks.filter(t => t.Id !== trackId)
    pl.trackIds = pl.trackIds.filter(id => id !== trackId)
  }

  async function renamePlaylist(playlistId, name) {
    const pl = playlists.value.find(p => p.id === playlistId)
    if (!pl) return
    await renameJellyfinPlaylist(playlistId, name)
    pl.name = name
  }

  async function deletePlaylist(playlistId) {
    await deleteJellyfinPlaylist(playlistId)
    playlists.value = playlists.value.filter(p => p.id !== playlistId)
  }

  async function reorderTrack(playlistId, fromIdx, toIdx) {
    const pl = playlists.value.find(p => p.id === playlistId)
    if (!pl) return
    // Optimistic local update
    const [track] = pl.tracks.splice(fromIdx, 1)
    pl.tracks.splice(toIdx, 0, track)
    pl.trackIds = pl.tracks.map(t => t.Id)
    // Sync to Jellyfin
    try {
      await moveJellyfinPlaylistItem(playlistId, fromIdx, toIdx)
    } catch {
      // If move fails, re-fetch to get back to true server state
      const items = await getJellyfinPlaylistItems(playlistId)
      pl.tracks   = items
      pl.trackIds = items.map(t => t.Id)
    }
  }

  return {
    playlists, isLoading,
    loadPlaylists, createPlaylist, addToPlaylist,
    removeFromPlaylist, renamePlaylist, deletePlaylist, reorderTrack,
  }
})
