import axios from 'axios'

const mb = axios.create({
  baseURL: 'https://musicbrainz.org/ws/2',
  headers: {
    'User-Agent': 'JellyPlay/1.0 (jellyplay@local)',
    Accept: 'application/json',
  },
})

export async function getArtistAlbums(mbArtistId) {
  const res = await mb.get('/release-group', {
    params: {
      artist:      mbArtistId,
      type:        'album',
      fmt:         'json',
      limit:       100,
    },
  })
  const groups = res.data['release-groups'] || []
  return groups
    .filter(rg => rg['primary-type'] === 'Album')
    .sort((a, b) =>
      new Date(b['first-release-date'] || 0) - new Date(a['first-release-date'] || 0)
    )
}

// Cover Art Archive — returns a URL that may 404; handle with onerror in template
export function coverArtUrl(mbReleaseGroupId) {
  return `https://coverartarchive.org/release-group/${mbReleaseGroupId}/front-250`
}
