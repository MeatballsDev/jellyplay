<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import NowPlayingBar from '@/components/layout/NowPlayingBar.vue'
import QueuePanel from '@/components/player/QueuePanel.vue'
import NowPlayingOverlay from '@/components/player/NowPlayingOverlay.vue'
import ToastNotification from '@/components/common/ToastNotification.vue'
import { useKeyboard } from '@/composables/useKeyboard'
import { useAuthStore } from '@/stores/auth'
import { usePlaylistStore } from '@/stores/playlist'

const route   = useRoute()
const auth    = useAuthStore()
const plStore = usePlaylistStore()

watch(() => auth.isLoggedIn, (loggedIn) => {
  if (loggedIn) plStore.loadPlaylists()
}, { immediate: true })
const isLoginPage = () => route.name === 'login'

const searchBarRef    = ref(null)
const eqPanelOpen     = ref(false)
const queuePanelOpen  = ref(false)
const nowPlayingOpen  = ref(false)

function focusSearch() {
  searchBarRef.value?.focus()
}

function toggleEQ() {
  eqPanelOpen.value = !eqPanelOpen.value
  if (eqPanelOpen.value) queuePanelOpen.value = false
}

function toggleQueue() {
  queuePanelOpen.value = !queuePanelOpen.value
  if (queuePanelOpen.value) eqPanelOpen.value = false
}

function toggleNowPlaying() {
  nowPlayingOpen.value = !nowPlayingOpen.value
}

useKeyboard({ onSearchFocus: focusSearch, onEQToggle: toggleEQ })
</script>

<template>
  <div class="app-shell" :class="{ 'login-layout': isLoginPage() }">
    <template v-if="!isLoginPage()">
      <AppSidebar />
      <div class="app-body">
        <AppHeader :search-ref="searchBarRef" @search-focus="focusSearch" />
        <main class="app-main">
          <RouterView v-slot="{ Component }">
            <Transition name="route" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </main>
      </div>

      <!-- Queue panel: fixed right sidebar -->
      <Transition name="slide-right">
        <QueuePanel
          v-if="queuePanelOpen"
          class="queue-sidebar"
          @close="toggleQueue"
        />
      </Transition>

      <NowPlayingBar
        :eq-open="eqPanelOpen"
        :queue-open="queuePanelOpen"
        :now-playing-open="nowPlayingOpen"
        @toggle-eq="toggleEQ"
        @toggle-queue="toggleQueue"
        @toggle-now-playing="toggleNowPlaying"
      />

      <!-- Full-screen now playing overlay -->
      <Transition name="np-fade">
        <NowPlayingOverlay
          v-if="nowPlayingOpen"
          @close="nowPlayingOpen = false"
        />
      </Transition>
    </template>

    <template v-else>
      <RouterView />
    </template>

    <ToastNotification />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
}

.app-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding-bottom: var(--nowplaying-height);
}

.login-layout {
  display: block;
}

/* Queue sidebar positioning */
.queue-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: var(--nowplaying-height);
  z-index: 90;
}

/* Slide-right transition */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform var(--duration-slow) var(--ease-default);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

/* Now playing overlay transition */
.np-fade-enter-active,
.np-fade-leave-active {
  transition: opacity var(--duration-slower) var(--ease-default),
              transform var(--duration-slower) var(--ease-default);
}
.np-fade-enter-from,
.np-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
