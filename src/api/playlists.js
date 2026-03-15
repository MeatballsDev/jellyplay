import { createJellyfinClient } from './jellyfin'
import { useAuthStore } from '@/stores/auth'

export async function getJellyfinPlaylists() {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get(`/Users/${auth.userId}/Items`, {
    params: {
      IncludeItemTypes: 'Playlist',
      Recursive: true,
      Fields: 'ChildCount',
    },
  })
  return data.Items || []
}

export async function getJellyfinPlaylistItems(playlistId) {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get(`/Playlists/${playlistId}/Items`, {
    params: {
      UserId: auth.userId,
      Fields: 'RunTimeTicks,MediaSources,ParentId,AlbumId,AlbumArtist',
    },
  })
  return data.Items || []
}

export async function createJellyfinPlaylist(name, trackIds = []) {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.post('/Playlists', {
    Name: name,
    Ids: trackIds,
    UserId: auth.userId,
    MediaType: 'Audio',
  })
  return data
}

export async function addToJellyfinPlaylist(playlistId, itemIds) {
  const client = createJellyfinClient()
  await client.post(`/Playlists/${playlistId}/Items`, null, {
    params: { Ids: Array.isArray(itemIds) ? itemIds.join(',') : itemIds },
  })
}

export async function removeFromJellyfinPlaylist(playlistId, entryIds) {
  const client = createJellyfinClient()
  await client.delete(`/Playlists/${playlistId}/Items`, {
    params: { EntryIds: Array.isArray(entryIds) ? entryIds.join(',') : entryIds },
  })
}

export async function moveJellyfinPlaylistItem(playlistId, itemIndex, newIndex) {
  const client = createJellyfinClient()
  await client.post(`/Playlists/${playlistId}/Items/${itemIndex}/Move/${newIndex}`)
}

export async function deleteJellyfinPlaylist(playlistId) {
  const client = createJellyfinClient()
  await client.delete(`/Items/${playlistId}`)
}

export async function renameJellyfinPlaylist(playlistId, name) {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data: item } = await client.get(`/Users/${auth.userId}/Items/${playlistId}`)
  await client.post(`/Items/${playlistId}`, { ...item, Name: name })
}
