<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authenticateByName } from '@/api/auth'

const router   = useRouter()
const auth     = useAuthStore()

const serverUrl = ref('http://localhost:8096')
const username  = ref('')
const password  = ref('')
const isLoading = ref(false)
const error     = ref('')

async function login() {
  if (!serverUrl.value || !username.value || !password.value) {
    error.value = 'All fields are required'
    return
  }
  isLoading.value = true
  error.value     = ''

  try {
    const data = await authenticateByName(serverUrl.value.trim(), username.value.trim(), password.value)
    auth.setAuth({
      token:     data.AccessToken,
      serverUrl: serverUrl.value.trim(),
      userId:    data.User.Id,
      username:  data.User.Name,
    })
    router.push({ name: 'home' })
  } catch (e) {
    error.value = e.response?.data?.Message || 'Connection failed. Check your server URL and credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Background grain texture -->
    <div class="bg-grain" />

    <div class="login-card">
      <!-- Logo mark -->
      <div class="logo">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10.5" stroke="var(--color-accent)" stroke-width="1.25" fill="var(--color-accent)" fill-opacity="0.07"/>
          <circle cx="12" cy="12" r="8"    stroke="var(--color-accent)" stroke-width="0.5"  fill="none" opacity="0.35"/>
          <circle cx="12" cy="12" r="5.5"  stroke="var(--color-accent)" stroke-width="0.5"  fill="none" opacity="0.25"/>
          <circle cx="12" cy="12" r="3.5"  fill="var(--color-accent)"/>
          <circle cx="12" cy="12" r="1.1"  fill="var(--color-bg)"/>
        </svg>
        <div>
          <h1 class="logo-name">JellyPlay</h1>
          <p class="logo-tagline">Your music, beautifully played</p>
        </div>
      </div>

      <form class="form" @submit.prevent="login">
        <div class="field">
          <label class="label">Server URL</label>
          <input
            v-model="serverUrl"
            class="input"
            type="url"
            placeholder="https://jellyfin.example.com"
            required
          />
        </div>

        <div class="field">
          <label class="label">Username</label>
          <input
            v-model="username"
            class="input"
            type="text"
            placeholder="Enter your username"
            required
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label class="label">Password</label>
          <input
            v-model="password"
            class="input"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <Transition name="fade">
          <p v-if="error" class="error">{{ error }}</p>
        </Transition>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="!isLoading">Sign In</span>
          <span v-else class="loading-dots">
            <span /><span /><span />
          </span>
        </button>
      </form>

      <p class="footnote">
        Connects to your Jellyfin media server
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  position: relative;
  overflow: hidden;
}

.bg-grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  background-size: 256px;
  pointer-events: none;
  opacity: 0.6;
}

/* Decorative radial glow */
.login-page::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 110, 0.06) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.login-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-xl);
  padding: var(--space-3xl) var(--space-2xl);
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-lg), 0 0 60px rgba(201, 169, 110, 0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-3xl);
}

.logo-name {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-accent);
  line-height: 1;
}

.logo-tagline {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 3px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-text-primary);
  padding: var(--space-md) var(--space-md);
  font-size: var(--text-base);
  font-family: var(--font-body);
  outline: none;
  transition: border-color var(--duration-base), box-shadow var(--duration-base);
}

.input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.error {
  color: #e07060;
  font-size: var(--text-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(224, 112, 96, 0.08);
  border: 1px solid rgba(224, 112, 96, 0.2);
  border-radius: var(--border-radius);
}

.submit-btn {
  margin-top: var(--space-sm);
  width: 100%;
  padding: var(--space-md);
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: var(--border-radius);
  font-size: var(--text-base);
  font-weight: 600;
  font-family: var(--font-body);
  letter-spacing: 0.02em;
  transition: background var(--duration-base), box-shadow var(--duration-base),
              transform var(--duration-fast);
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-accent-soft);
  box-shadow: var(--shadow-glow);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-dots {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-bg);
  animation: dot-bounce 0.6s infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.1s; }
.loading-dots span:nth-child(3) { animation-delay: 0.2s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.1); opacity: 1; }
}

.footnote {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-xl);
}
</style>
