<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAlbumArtUrl } from '@/api/stream'

const props = defineProps({
  artist: { type: Object, required: true },
})

const router = useRouter()
const artUrl = computed(() => getAlbumArtUrl(props.artist.Id, 300))

function navigate() {
  router.push({ name: 'artist', params: { id: props.artist.Id } })
}
</script>

<template>
  <div class="artist-card" @click="navigate">
    <div class="art-wrap">
      <img v-if="artUrl" :src="artUrl" :alt="artist.Name" class="art" loading="lazy" />
      <div v-else class="art-placeholder">
        {{ artist.Name?.charAt(0)?.toUpperCase() }}
      </div>
    </div>
    <div class="artist-name">{{ artist.Name }}</div>
    <div v-if="artist.AlbumCount" class="artist-meta">
      {{ artist.AlbumCount }} album{{ artist.AlbumCount !== 1 ? 's' : '' }}
    </div>
  </div>
</template>

<style scoped>
.artist-card {
  cursor: pointer;
  text-align: center;
  transition: transform var(--duration-slow) var(--ease-default);
}

.artist-card:hover {
  transform: translateY(-2px);
}

.art-wrap {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-surface-alt);
  box-shadow: var(--shadow-art);
  margin: 0 auto var(--space-sm);
  transition: box-shadow var(--duration-slow);
}

.artist-card:hover .art-wrap {
  box-shadow: var(--shadow-glow);
}

.art {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter var(--duration-slow);
}

.artist-card:hover .art {
  filter: brightness(0.85);
}

.art-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-accent);
  background: linear-gradient(135deg, var(--color-surface-alt) 0%, var(--color-border) 100%);
}

.artist-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}
</style>
