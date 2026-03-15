import axios from 'axios'

const CLIENT_INFO = 'Client="JellyPlay", Device="Browser", DeviceId="jellyplay-web-v1", Version="1.0.0"'

export function createJellyfinClient() {
  const token     = localStorage.getItem('jp_token')  || ''
  const serverUrl = localStorage.getItem('jp_server') || ''

  return axios.create({
    baseURL: serverUrl,
    headers: {
      'X-Emby-Authorization': `MediaBrowser ${CLIENT_INFO}, Token="${token}"`,
      'Content-Type': 'application/json',
    },
  })
}

export function getAuthHeader(token) {
  return `MediaBrowser ${CLIENT_INFO}, Token="${token}"`
}

export { CLIENT_INFO }
