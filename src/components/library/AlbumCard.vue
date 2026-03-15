<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAlbumArtUrl } from '@/api/stream'
import { getAlbumTracks } from '@/api/library'
import { usePlayerStore } from '@/stores/player'

const props = defineProps({
  album: { type: Object, required: true },
})

const router = useRouter()
const player = usePlayerStore()

const artUrl = computed(() => getAlbumArtUrl(props.album.Id, 300))

const isActive = computed(() =>
  player.currentTrack?.AlbumId === props.album.Id
)

function navigate() {
  router.push({ name: 'album', params: { id: props.album.Id } })
}

async function playNow(e) {
  e.stopPropagation()
  const tracks = await getAlbumTracks(props.album.Id)
  if (tracks.length) player.playTrack(tracks[0], tracks)
}
</script>

<template>
  <div
    class="album-card"
    :class="{ active: isActive }"
    @click="navigate"
  >
    <div class="art-wrap">
      <img
        v-if="artUrl"
        :src="artUrl"
        :alt="album.Name"
        class="art"
        loading="lazy"
      />
      <div v-else class="art-placeholder">♪</div>

      <button class="play-btn" @click="playNow" title="Play album">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </button>
    </div>

    <div class="card-info">
      <div class="card-title" :title="album.Name">{{ album.Name }}</div>
      <div class="card-meta">
        <span v-if="album.ProductionYear">{{ album.ProductionYear }}</span>
        <span v-if="album.ChildCount"> · {{ album.ChildCount }} tracks</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.album-card {
  cursor: pointer;
  transition: transform var(--duration-slow) var(--ease-default);
}

.album-card:hover {
  transform: translateY(-2px);
}

.art-wrap {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: var(--color-surface-alt);
  box-shadow: var(--shadow-art);
  margin-bottom: var(--space-sm);
}

.art {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter var(--duration-slow) var(--ease-default);
}

.art-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--color-text-muted);
  background: var(--color-surface-alt);
}

.play-btn {
  position: absolute;
  bottom: var(--space-sm);
  right: var(--space-sm);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity var(--duration-slow) var(--ease-default),
              transform var(--duration-slow) var(--ease-default),
              box-shadow var(--duration-slow) var(--ease-default);
  box-shadow: var(--shadow-md);
}

.album-card:hover .art {
  filter: brightness(0.75);
}

.album-card:hover .play-btn {
  opacity: 1;
  transform: translateY(0);
  box-shadow: var(--shadow-glow);
}

.play-btn:hover {
  transform: scale(1.1) !important;
}

.active .art-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--color-accent);
  border-radius: var(--border-radius);
}

.card-info {
  padding: 0 2px;
}

.card-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active .card-title {
  color: var(--color-accent);
}

.card-meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}
</style>
