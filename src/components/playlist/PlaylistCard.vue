<script setup>
import { useRouter } from 'vue-router'

const props  = defineProps({ playlist: { type: Object, required: true } })
const router = useRouter()

function navigate() {
  router.push({ name: 'playlist', params: { id: props.playlist.id } })
}
</script>

<template>
  <div class="playlist-card" @click="navigate">
    <div class="art">
      <span class="art-icon">♫</span>
    </div>
    <div class="info">
      <div class="name">{{ playlist.name }}</div>
      <div class="meta">{{ playlist.tracks?.length || 0 }} tracks</div>
    </div>
  </div>
</template>

<style scoped>
.playlist-card {
  cursor: pointer;
  transition: transform var(--duration-slow) var(--ease-default);
}

.playlist-card:hover {
  transform: translateY(-2px);
}

.art {
  aspect-ratio: 1;
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, var(--color-surface-alt) 0%, var(--color-border) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-art);
  margin-bottom: var(--space-sm);
  transition: box-shadow var(--duration-slow);
}

.playlist-card:hover .art {
  box-shadow: var(--shadow-glow);
}

.art-icon {
  font-size: 2rem;
  color: var(--color-accent);
  opacity: 0.8;
}

.name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}
</style>
