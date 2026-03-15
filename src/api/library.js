import { createJellyfinClient } from './jellyfin'
import { useAuthStore } from '@/stores/auth'

export async function getAlbums() {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get(`/Users/${auth.userId}/Items`, {
    params: {
      IncludeItemTypes: 'MusicAlbum',
      Recursive: true,
      SortBy: 'SortName',
      SortOrder: 'Ascending',
      Fields: 'PrimaryImageAspectRatio,DateCreated,ChildCount,ProductionYear',
      Limit: 2000,
    },
  })
  return data.Items || []
}

export async function getArtists() {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get('/Artists', {
    params: {
      userId: auth.userId,
      SortBy: 'SortName',
      SortOrder: 'Ascending',
      Fields: 'PrimaryImageAspectRatio,ItemCounts',
      Limit: 2000,
    },
  })
  return data.Items || []
}

export async function getAlbumTracks(albumId) {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get(`/Users/${auth.userId}/Items`, {
    params: {
      ParentId: albumId,
      SortBy: 'IndexNumber,SortName',
      SortOrder: 'Ascending',
      Fields: 'RunTimeTicks,MediaSources,ParentId,AlbumId,AlbumArtist',
    },
  })
  return data.Items || []
}

export async function getArtistDetails(artistId) {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get(`/Users/${auth.userId}/Items/${artistId}`)
  return data
}

export async function getArtistAlbums(artistId) {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get(`/Users/${auth.userId}/Items`, {
    params: {
      AlbumArtistIds: artistId,
      IncludeItemTypes: 'MusicAlbum',
      Recursive: true,
      SortBy: 'ProductionYear,SortName',
      SortOrder: 'Descending',
      Fields: 'PrimaryImageAspectRatio,DateCreated,ProductionYear,ChildCount',
    },
  })
  return data.Items || []
}

export async function getRecentArtists() {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get('/Artists', {
    params: {
      userId:       auth.userId,
      SortBy:       'DateCreated',
      SortOrder:    'Descending',
      Limit:        12,
      Fields:       'PrimaryImageAspectRatio,ItemCounts',
    },
  })
  return data.Items || []
}

export async function getRecentAlbums() {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get(`/Users/${auth.userId}/Items`, {
    params: {
      IncludeItemTypes: 'MusicAlbum',
      Recursive: true,
      SortBy: 'DateCreated',
      SortOrder: 'Descending',
      Limit: 24,
      Fields: 'PrimaryImageAspectRatio,ProductionYear',
    },
  })
  return data.Items || []
}

export async function getAllTracks() {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get(`/Users/${auth.userId}/Items`, {
    params: {
      IncludeItemTypes: 'Audio',
      Recursive: true,
      SortBy: 'SortName',
      SortOrder: 'Ascending',
      Fields: 'RunTimeTicks,AlbumArtist,ParentId,AlbumId',
      Limit: 5000,
    },
  })
  return data.Items || []
}

export async function searchItems(query) {
  const auth = useAuthStore()
  const client = createJellyfinClient()
  const { data } = await client.get(`/Users/${auth.userId}/Items`, {
    params: {
      SearchTerm: query,
      IncludeItemTypes: 'Audio,MusicAlbum,MusicArtist',
      Recursive: true,
      Limit: 60,
      Fields: 'PrimaryImageAspectRatio,RunTimeTicks,AlbumArtist,ParentId',
    },
  })
  return data.Items || []
}
