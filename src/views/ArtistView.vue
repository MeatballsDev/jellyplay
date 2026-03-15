<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArtistDetails, getArtistAlbums } from '@/api/library'
import { getAlbumArtUrl } from '@/api/stream'
import AlbumCard from '@/components/library/AlbumCard.vue'
import SectionHeading from '@/components/library/SectionHeading.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route  = useRoute()
const router = useRouter()

const artist    = ref(null)
const albums    = ref([])
const isLoading = ref(true)

const artUrl = () => getAlbumArtUrl(route.params.id, 400)

onMounted(async () => {
  try {
    ;[artist.value, albums.value] = await Promise.all([
      getArtistDetails(route.params.id),
      getArtistAlbums(route.params.id),
    ])
  } catch {
    router.push({ name: 'library' })
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="artist-view">
    <LoadingSpinner v-if="isLoading" size="lg" />

    <template v-else-if="artist">
      <!-- Header -->
      <div class="artist-header">
        <div class="header-art">
          <img v-if="artUrl()" :src="artUrl()" :alt="artist.Name" class="header-img" />
          <div v-else class="header-placeholder">
            {{ artist.Name?.charAt(0)?.toUpperCase() }}
          </div>
        </div>
        <div class="header-overlay">
          <p class="header-eyebrow">Artist</p>
          <h1 class="header-title">{{ artist.Name }}</h1>
          <p class="header-meta">{{ albums.length }} album{{ albums.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Discography -->
      <div class="discography">
        <SectionHeading eyebrow="Discography" title="Albums" />
        <div class="album-grid">
          <AlbumCard
            v-for="album in albums"
            :key="album.Id"
            :album="album"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.artist-view {
  max-width: 1200px;
}

.artist-header {
  position: relative;
  height: 280px;
  overflow: hidden;
  margin-bottom: var(--space-2xl);
}

.header-art {
  position: absolute;
  inset: 0;
}

.header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.header-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, var(--color-surface-alt) 0%, var(--color-surface) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 6rem;
  font-weight: 700;
  color: var(--color-accent);
  opacity: 0.3;
}

.header-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-2xl);
  background: linear-gradient(to top, rgba(26, 18, 9, 0.95) 0%, transparent 100%);
}

.header-eyebrow {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-accent);
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
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.header-meta {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.discography {
  padding: 0 var(--space-2xl) var(--space-2xl);
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-xl);
}
</style>
