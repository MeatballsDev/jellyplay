<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlaylistStore } from '@/stores/playlist'
import CreatePlaylistModal from '@/components/playlist/CreatePlaylistModal.vue'
import { ref } from 'vue'

const router  = useRouter()
const route   = useRoute()
const auth    = useAuthStore()
const plStore = usePlaylistStore()

const showCreateModal = ref(false)

const navItems = ['home', 'library', 'search']

function isActive(name) {
  return route.name === name
}

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10.5" stroke="var(--color-accent)" stroke-width="1.25" fill="var(--color-accent)" fill-opacity="0.07"/>
        <circle cx="12" cy="12" r="8"    stroke="var(--color-accent)" stroke-width="0.5"  fill="none" opacity="0.35"/>
        <circle cx="12" cy="12" r="5.5"  stroke="var(--color-accent)" stroke-width="0.5"  fill="none" opacity="0.25"/>
        <circle cx="12" cy="12" r="3.5"  fill="var(--color-accent)"/>
        <circle cx="12" cy="12" r="1.1"  fill="var(--color-bg)"/>
      </svg>
      <span class="logo-text">JellyPlay</span>
    </div>

    <!-- Main nav -->
    <nav class="sidebar-nav">
      <RouterLink :to="{ name: 'home' }" class="nav-item" :class="{ active: isActive('home') }">
        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span class="nav-label">Home</span>
      </RouterLink>

      <RouterLink :to="{ name: 'library' }" class="nav-item" :class="{ active: isActive('library') && !route.query.tab }">
        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span class="nav-label">Library</span>
      </RouterLink>
      <RouterLink :to="{ name: 'library', query: { tab: 'songs' } }" class="nav-item nav-sub" :class="{ active: isActive('library') && route.query.tab === 'songs' }">
        <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <span class="nav-label">All Songs</span>
      </RouterLink>

      <RouterLink :to="{ name: 'search' }" class="nav-item" :class="{ active: isActive('search') }">
        <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span class="nav-label">Search</span>
      </RouterLink>
    </nav>

    <div class="sidebar-divider" />

    <!-- Playlists -->
    <div class="playlists-section">
      <div class="playlists-header">
        <span class="section-label">Playlists</span>
        <button class="add-btn" title="New playlist" @click="showCreateModal = true">+</button>
      </div>

      <div class="playlists-list">
        <RouterLink
          v-for="pl in plStore.playlists"
          :key="pl.id"
          :to="{ name: 'playlist', params: { id: pl.id } }"
          class="playlist-item"
          :class="{ active: route.params.id === pl.id }"
        >
          <span class="playlist-dot" />
          <span class="playlist-name">{{ pl.name }}</span>
        </RouterLink>

        <div v-if="!plStore.playlists.length" class="no-playlists">
          No playlists yet
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">{{ auth.username?.charAt(0)?.toUpperCase() }}</div>
        <span class="user-name">{{ auth.username }}</span>
      </div>
      <RouterLink :to="{ name: 'settings' }" class="settings-btn" title="Settings">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
          <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
          <line x1="1" y1="14" x2="7" y2="14"/>
          <line x1="9" y1="8" x2="15" y2="8"/>
          <line x1="17" y1="16" x2="23" y2="16"/>
        </svg>
      </RouterLink>
      <button class="logout-btn" title="Sign out" @click="logout">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  </aside>

  <CreatePlaylistModal
    v-if="showCreateModal"
    @close="showCreateModal = false"
  />
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Radial glow on hover */
.sidebar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 160px 280px at 0% 50%,
    rgba(201, 169, 110, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-slow) var(--ease-default);
}

.sidebar:hover::after {
  opacity: 1;
}

/* Logo — height must match --header-height so the border-bottom lines up */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  height: var(--header-height);
  padding: 0 var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.logo-text {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: 0.02em;
}

/* Nav */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: var(--space-md) var(--space-sm);
  gap: var(--space-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: color var(--duration-base) var(--ease-default),
              background var(--duration-base) var(--ease-default);
  text-decoration: none;
}

.nav-item:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-alt);
}

.nav-item.active {
  color: var(--color-accent);
  background: var(--color-accent-dim);
}

.nav-sub {
  padding-left: calc(var(--space-md) + 30px);
  font-size: var(--text-xs);
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Divider */
.sidebar-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-xs) var(--space-lg);
}

/* Playlists */
.playlists-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: var(--space-md) var(--space-sm) 0;
}

.playlists-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md);
  margin-bottom: var(--space-sm);
}

.section-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.add-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  font-size: var(--text-md);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: color var(--duration-base), background var(--duration-base);
}

.add-btn:hover {
  color: var(--color-accent);
  background: var(--color-border);
}

.playlists-list {
  overflow-y: auto;
  flex: 1;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--border-radius);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-decoration: none;
  transition: color var(--duration-base), background var(--duration-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-item:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-alt);
}

.playlist-item.active {
  color: var(--color-accent);
}

.playlist-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border);
  flex-shrink: 0;
  transition: background var(--duration-base);
}

.playlist-item.active .playlist-dot,
.playlist-item:hover .playlist-dot {
  background: var(--color-accent);
}

.playlist-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-playlists {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

/* Footer */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
  height: var(--nowplaying-height);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent-dim);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  font-size: var(--text-xs);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-btn,
.logout-btn {
  color: var(--color-text-muted);
  font-size: var(--text-md);
  padding: var(--space-xs);
  border-radius: var(--border-radius-sm);
  transition: color var(--duration-base);
  text-decoration: none;
  display: flex;
  align-items: center;
}

.settings-btn:hover,
.logout-btn:hover {
  color: var(--color-accent);
}
</style>
