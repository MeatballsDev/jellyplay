<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { getAlbumTracks } from '@/api/library'
import { getAlbumArtUrl, formatDuration } from '@/api/stream'
import TrackRow from '@/components/library/TrackRow.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route  = useRoute()
const router = useRouter()
const player = usePlayerStore()

const tracks    = ref([])
const isLoading = ref(true)
const albumMeta = computed(() => tracks.value[0] ? {
  name:       tracks.value[0].Album,
  artist:     tracks.value[0].AlbumArtist,
  year:       tracks.value[0].ProductionYear,
  trackCount: tracks.value.length,
  duration:   tracks.value.reduce((s, t) => s + (t.RunTimeTicks || 0), 0),
} : null)

const artUrl = computed(() => getAlbumArtUrl(route.params.id, 400))

onMounted(async () => {
  try {
    tracks.value = await getAlbumTracks(route.params.id)
  } catch {
    router.push({ name: 'library' })
  } finally {
    isLoading.value = false
  }
})

function playAll(index = 0) {
  if (tracks.value.length) player.playTrack(tracks.value[index], tracks.value)
}
</script>

<template>
  <div class="album-view">
    <LoadingSpinner v-if="isLoading" size="lg" />

    <template v-else-if="albumMeta">
      <!-- Header -->
      <div class="album-header">
        <div class="art-wrap">
          <img v-if="artUrl" :src="artUrl" :alt="albumMeta.name" class="art" />
          <div v-else class="art-placeholder">♪</div>
        </div>

        <div class="header-info">
          <p class="header-eyebrow">Album</p>
          <h1 class="header-title">{{ albumMeta.name }}</h1>
          <p class="header-meta">
            <span
              class="artist-link"
              @click="router.push({ name: 'artist', params: { id: tracks[0]?.AlbumArtistId || '' } })"
            >{{ albumMeta.artist }}</span>
            <span v-if="albumMeta.year"> · {{ albumMeta.year }}</span>
            <span> · {{ albumMeta.trackCount }} tracks</span>
            <span> · {{ formatDuration(albumMeta.duration) }}</span>
          </p>

          <div class="header-actions">
            <button class="play-btn" @click="playAll()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Play
            </button>
            <button class="shuffle-btn" @click="player.shuffleOn = true; playAll()">
              Shuffle
            </button>
          </div>
        </div>
      </div>

      <!-- Track list -->
      <div class="tracks">
        <div class="tracks-header">
          <span class="col-num">#</span>
          <span class="col-title">Title</span>
          <span class="col-duration">Duration</span>
        </div>
        <div class="tracks-divider" />
        <TrackRow
          v-for="(track, i) in tracks"
          :key="track.Id"
          :track="track"
          :index="i"
          :queue="tracks"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.album-view {
  padding: var(--space-2xl);
  max-width: 1000px;
}

.album-header {
  display: flex;
  gap: var(--space-2xl);
  align-items: flex-end;
  margin-bottom: var(--space-3xl);
  padding-bottom: var(--space-2xl);
  border-bottom: 1px solid var(--color-border);
}

.art-wrap {
  flex-shrink: 0;
}

.art {
  width: 200px;
  height: 200px;
  border-radius: var(--border-radius-lg);
  object-fit: cover;
  box-shadow: var(--shadow-lg);
}

.art-placeholder {
  width: 200px;
  height: 200px;
  border-radius: var(--border-radius-lg);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: var(--color-text-muted);
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-eyebrow {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: var(--space-xs);
}

.header-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.1;
  margin-bottom: var(--space-sm);
}

.header-meta {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-xl);
}

.artist-link {
  color: var(--color-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: color var(--duration-base);
}

.artist-link:hover {
  color: var(--color-accent);
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.play-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: var(--border-radius-full);
  font-size: var(--text-base);
  font-weight: 600;
  transition: background var(--duration-base), box-shadow var(--duration-base);
}

.play-btn:hover {
  background: var(--color-accent-soft);
  box-shadow: var(--shadow-glow);
}

.shuffle-btn {
  padding: var(--space-sm) var(--space-xl);
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full);
  font-size: var(--text-base);
  font-weight: 500;
  transition: color var(--duration-base), border-color var(--duration-base);
}

.shuffle-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-accent);
}

.tracks {
  padding: 0 var(--space-sm);
}

.tracks-header {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: var(--space-md);
  padding: 0 var(--space-md) var(--space-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tracks-divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: var(--space-sm);
}
</style>
