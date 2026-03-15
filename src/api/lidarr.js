import axios from 'axios'
import { useSettingsStore } from '@/stores/settings'

function client() {
  const s = useSettingsStore()
  return axios.create({
    baseURL: s.lidarrUrl.replace(/\/$/, ''),
    headers: { 'X-Api-Key': s.lidarrApiKey },
  })
}

export async function testConnection() {
  const res = await client().get('/api/v1/system/status')
  return res.data
}

export async function getQualityProfiles() {
  const res = await client().get('/api/v1/qualityprofile')
  return res.data
}

export async function getMetadataProfiles() {
  const res = await client().get('/api/v1/metadataprofile')
  return res.data
}

export async function getRootFolders() {
  const res = await client().get('/api/v1/rootfolder')
  return res.data
}

export async function lookupArtists(query) {
  const res = await client().get('/api/v1/artist/lookup', { params: { term: query } })
  return res.data
}

export async function lookupAlbums(query) {
  const res = await client().get('/api/v1/album/lookup', { params: { term: query } })
  return res.data
}


export async function downloadArtist(lookupArtist) {
  const s = useSettingsStore()
  const res = await client().post('/api/v1/artist', {
    foreignArtistId:   lookupArtist.foreignArtistId,
    artistName:        lookupArtist.artistName,
    qualityProfileId:  s.lidarrQualityProfileId,
    metadataProfileId: s.lidarrMetaProfileId,
    rootFolderPath:    s.lidarrRootFolder,
    monitored:         true,
    addOptions: {
      monitor:                'all',
      searchForMissingAlbums: true,
    },
  })
  return res.data
}

async function waitForAlbum(c, artistId, foreignAlbumId, retries = 8, delayMs = 1500) {
  for (let i = 0; i < retries; i++) {
    const res = await c.get('/api/v1/album', { params: { artistId } })
    const album = res.data.find(a => a.foreignAlbumId === foreignAlbumId)
    if (album) return album
    if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs))
  }
  throw new Error('Album not found in Lidarr after waiting — please try again')
}

export async function downloadAlbum(lookupAlbum) {
  const s = useSettingsStore()
  const foreignArtistId = lookupAlbum.artist.foreignArtistId
  const foreignAlbumId  = lookupAlbum.foreignAlbumId
  const c = client()

  // 1. Get or add the artist
  const artistsRes = await c.get('/api/v1/artist')
  let artist = artistsRes.data.find(a => a.foreignArtistId === foreignArtistId)

  if (!artist) {
    const addRes = await c.post('/api/v1/artist', {
      foreignArtistId,
      artistName:        lookupAlbum.artist.artistName,
      qualityProfileId:  s.lidarrQualityProfileId,
      metadataProfileId: s.lidarrMetaProfileId,
      rootFolderPath:    s.lidarrRootFolder,
      monitored:         true,
      addOptions: {
        monitor:                'none',
        searchForMissingAlbums: false,
      },
    })
    artist = addRes.data
    // Tell Lidarr to immediately sync this artist from MusicBrainz
    await c.post('/api/v1/command', { name: 'RefreshArtist', artistId: artist.id })
  }

  // 2. Poll for the album — Lidarr syncs albums from MusicBrainz asynchronously
  const album = await waitForAlbum(c, artist.id, foreignAlbumId)

  // 3. Set album as monitored
  await c.put('/api/v1/album/monitor', { albumIds: [album.id], monitored: true })

  // 4. Trigger download search
  await c.post('/api/v1/command', { name: 'AlbumSearch', albumIds: [album.id] })

  return album
}
