<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { getAlbumArtUrl } from '@/api/stream'

const player = usePlayerStore()

const artUrl = computed(() => {
  if (!player.currentTrack) return null
  const id = player.currentTrack.AlbumId || player.currentTrack.Id
  return getAlbumArtUrl(id, 80)
})

const title  = computed(() => player.currentTrack?.Name || '')
const artist = computed(() => player.currentTrack?.AlbumArtist || player.currentTrack?.Artists?.[0] || '')
const album  = computed(() => player.currentTrack?.Album || '')
</script>

<template>
  <div class="track-info" v-if="player.currentTrack">
    <div class="art-wrap">
      <img v-if="artUrl" :src="artUrl" :alt="album" class="art" />
      <div v-else class="art-placeholder">♪</div>
    </div>
    <div class="track-text">
      <div class="track-title" :title="title">{{ title }}</div>
      <div class="track-artist" :title="artist">{{ artist }}</div>
    </div>
  </div>
  <div class="track-info track-info--empty" v-else>
    <div class="art-placeholder">♪</div>
    <div class="track-text">
      <div class="track-title muted">Nothing playing</div>
    </div>
  </div>
</template>

<style scoped>
.track-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 0;
}

.art-wrap {
  flex-shrink: 0;
}

.art {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius);
  object-fit: cover;
  box-shadow: var(--shadow-art);
}

.art-placeholder {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
}

.track-text {
  min-width: 0;
}

.track-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.track-title.muted {
  color: var(--color-text-muted);
  font-style: italic;
}

.track-artist {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
  margin-top: 2px;
}
</style>
