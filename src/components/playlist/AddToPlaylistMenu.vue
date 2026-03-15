<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlaylistStore } from '@/stores/playlist'
import CreatePlaylistModal from './CreatePlaylistModal.vue'

const props = defineProps({ track: { type: Object, required: true } })
const emit  = defineEmits(['close'])

const plStore     = usePlaylistStore()
const showCreate  = ref(false)
const menuEl      = ref(null)

function addTo(playlist) {
  plStore.addToPlaylist(playlist.id, props.track)
  emit('close')
}

function onCreateDone(pl) {
  plStore.addToPlaylist(pl.id, props.track)
  showCreate.value = false
  emit('close')
}

function onClickOutside(e) {
  if (menuEl.value && !menuEl.value.contains(e.target)) {
    emit('close')
  }
}

onMounted(() => {
  setTimeout(() => document.addEventListener('click', onClickOutside), 0)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div ref="menuEl" class="menu">
    <div class="menu-header">Add to playlist</div>

    <button
      class="menu-item menu-item--new"
      @click="showCreate = true"
    >
      <span class="icon">+</span>
      New playlist
    </button>

    <div v-if="plStore.playlists.length" class="divider" />

    <button
      v-for="pl in plStore.playlists"
      :key="pl.id"
      class="menu-item"
      @click="addTo(pl)"
    >
      <span class="pl-dot" />
      {{ pl.name }}
    </button>

    <div v-if="!plStore.playlists.length" class="empty">
      No playlists yet
    </div>
  </div>

  <CreatePlaylistModal
    v-if="showCreate"
    @close="showCreate = false"
    @created="onCreateDone"
  />
</template>

<style scoped>
.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  min-width: 180px;
  z-index: 200;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.menu-header {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: left;
  transition: background var(--duration-base), color var(--duration-base);
}

.menu-item:hover {
  background: var(--color-border);
  color: var(--color-text-primary);
}

.menu-item--new {
  color: var(--color-accent);
}

.menu-item--new:hover {
  color: var(--color-accent-soft);
}

.icon {
  font-size: var(--text-md);
  font-weight: 300;
  line-height: 1;
}

.pl-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border);
  flex-shrink: 0;
}

.divider {
  height: 1px;
  background: var(--color-border);
}

.empty {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
