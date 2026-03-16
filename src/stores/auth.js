import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCurrentUser } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token     = ref(localStorage.getItem('jp_token')    || '')
  const serverUrl = ref(localStorage.getItem('jp_server')   || '')
  const userId    = ref(localStorage.getItem('jp_userId')   || '')
  const username  = ref(localStorage.getItem('jp_username') || '')

  const isLoggedIn = computed(() => !!token.value && !!serverUrl.value)

  function setAuth({ token: t, serverUrl: s, userId: u, username: n }) {
    token.value     = t
    serverUrl.value = s
    userId.value    = u
    username.value  = n
    localStorage.setItem('jp_token',    t)
    localStorage.setItem('jp_server',   s)
    localStorage.setItem('jp_userId',   u)
    localStorage.setItem('jp_username', n)
  }

  async function validateSession() {
    if (!token.value || !serverUrl.value) return false
    try {
      await getCurrentUser(serverUrl.value, token.value)
      return true
    } catch {
      logout()
      return false
    }
  }

  function logout() {
    token.value     = ''
    serverUrl.value = ''
    userId.value    = ''
    username.value  = ''
    localStorage.removeItem('jp_token')
    localStorage.removeItem('jp_server')
    localStorage.removeItem('jp_userId')
    localStorage.removeItem('jp_username')
  }

  return { token, serverUrl, userId, username, isLoggedIn, setAuth, logout, validateSession }
})
