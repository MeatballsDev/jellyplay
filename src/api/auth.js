import axios from 'axios'
import { CLIENT_INFO } from './jellyfin'

export async function authenticateByName(serverUrl, username, password) {
  const url = serverUrl.replace(/\/$/, '')
  const { data } = await axios.post(
    `${url}/Users/AuthenticateByName`,
    { Username: username, Pw: password },
    {
      headers: {
        'X-Emby-Authorization': `MediaBrowser ${CLIENT_INFO}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return data
}

export async function getCurrentUser(serverUrl, token) {
  const url = serverUrl.replace(/\/$/, '')
  const { data } = await axios.get(`${url}/Users/Me`, {
    headers: {
      'X-Emby-Authorization': `MediaBrowser ${CLIENT_INFO}, Token="${token}"`,
    },
  })
  return data
}
