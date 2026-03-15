<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { getAlbumArtUrl, formatDuration } from '@/api/stream'
import { getAlbumTracks } from '@/api/library'

const props  = defineProps({ item: { type: Object, required: true } })
const router = useRouter()
const player = usePlayerStore()

const artUrl  = computed(() => getAlbumArtUrl(props.item.AlbumId || props.item.Id, 60))
const typeIcon = computed(() => ({
  Audio: '♪', MusicAlbum: '◫', MusicArtist: '♟',
}[props.item.Type] || '♪'))

const subtitle = computed(() => {
  if (props.item.Type === 'Audio') return props.item.AlbumArtist || props.item.Artists?.[0]
  if (props.item.Type === 'MusicAlbum') return props.item.AlbumArtist
  return ''
})

const duration = computed(() =>
  props.item.Type === 'Audio' ? formatDuration(props.item.RunTimeTicks) : ''
)

async function activate() {
  if (props.item.Type === 'Audio') {
    player.playTrack(props.item, [props.item])
  } else if (props.item.Type === 'MusicAlbum') {
    router.push({ name: 'album', params: { id: props.item.Id } })
  } else if (props.item.Type === 'MusicArtist') {
    router.push({ name: 'artist', params: { id: props.item.Id } })
  }
}
</script>

<template>
  <div class="result-row" @click="activate">
    <div class="art-wrap">
      <img v-if="artUrl" :src="artUrl" class="art" loading="lazy" />
      <div v-else class="art-placeholder">{{ typeIcon }}</div>
    </div>
    <div class="result-text">
      <span class="result-name">{{ item.Name }}</span>
      <span v-if="subtitle" class="result-sub">{{ subtitle }}</span>
    </div>
    <div class="result-meta">
      <span class="type-badge">{{ item.Type === 'Audio' ? 'Track' : item.Type === 'MusicAlbum' ? 'Album' : 'Artist' }}</span>
      <span v-if="duration" class="duration">{{ duration }}</span>
    </div>
  </div>
</template>

<style scoped>
.result-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background var(--duration-base);
}

.result-row:hover {
  background: var(--color-surface-alt);
}

.art-wrap {
  flex-shrink: 0;
}

.art {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
}

.art-placeholder {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-sm);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}

.result-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.result-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-sub {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.type-badge {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full);
  padding: 1px 7px;
}

.duration {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
