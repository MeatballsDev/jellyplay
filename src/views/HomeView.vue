<script setup>
import { onMounted, computed } from 'vue'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import { getRecentAlbums, getRecentArtists, getAlbumTracks } from '@/api/library'
import { getAlbumArtUrl } from '@/api/stream'
import AlbumCard from '@/components/library/AlbumCard.vue'
import ArtistCard from '@/components/library/ArtistCard.vue'
import SectionHeading from '@/components/library/SectionHeading.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const library = useLibraryStore()
const player  = usePlayerStore()

const hour = new Date().getHours()
const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : hour < 22 ? 'Good evening' : 'Good night'

onMounted(async () => {
  const fetches = []
  if (!library.recentAlbums.length)  fetches.push(getRecentAlbums().then(d => library.setRecentAlbums(d)).catch(() => {}))
  if (!library.recentArtists.length) fetches.push(getRecentArtists().then(d => library.setRecentArtists(d)).catch(() => {}))
  await Promise.all(fetches)
})

async function playAlbum(album) {
  const tracks = await getAlbumTracks(album.Id)
  if (tracks.length) player.playTrack(tracks[0], tracks)
}
</script>

<template>
  <div class="home">
    <div class="hero">
      <p class="hero-eyebrow">{{ greeting }}</p>
      <h1 class="hero-title">What's the mood?</h1>
    </div>

    <!-- Recently played -->
    <section v-if="library.recentlyPlayed.length" class="section">
      <SectionHeading eyebrow="History" title="Recently Played" />
      <div class="recent-grid">
        <div
          v-for="track in library.recentlyPlayed.slice(0, 6)"
          :key="track.Id"
          class="recent-item"
          @click="player.playTrack(track, library.recentlyPlayed)"
        >
          <div class="recent-art">
            <img
              v-if="getAlbumArtUrl(track.AlbumId, 120)"
              :src="getAlbumArtUrl(track.AlbumId, 120)"
              :alt="track.Album"
            />
            <span v-else>♪</span>
          </div>
          <span class="recent-name">{{ track.Album || track.Name }}</span>
        </div>
      </div>
    </section>

    <!-- Recently added albums -->
    <section class="section">
      <SectionHeading eyebrow="Library" title="Recently Added Albums" />
      <LoadingSpinner v-if="!library.recentAlbums.length" />
      <div v-else class="album-grid">
        <AlbumCard
          v-for="album in library.recentAlbums"
          :key="album.Id"
          :album="album"
        />
      </div>
    </section>

    <!-- Recently added artists -->
    <section class="section">
      <SectionHeading eyebrow="Library" title="Recently Added Artists" />
      <LoadingSpinner v-if="!library.recentArtists.length" />
      <div v-else class="artist-grid">
        <ArtistCard
          v-for="artist in library.recentArtists"
          :key="artist.Id"
          :artist="artist"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding: var(--space-2xl) var(--space-2xl) var(--space-xl);
  width: 100%;
  box-sizing: border-box;
}

.hero {
  margin-bottom: var(--space-3xl);
  padding: var(--space-2xl) 0 var(--space-xl);
  border-bottom: 1px solid var(--color-border);
}

.hero-eyebrow {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: var(--space-xs);
}

.hero-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.15;
}

.section {
  margin-bottom: var(--space-3xl);
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.recent-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  background: var(--color-surface-alt);
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: background var(--duration-base) var(--ease-default);
}

.recent-item:hover {
  background: var(--color-border);
}

.recent-art {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  overflow: hidden;
}

.recent-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  padding-right: var(--space-md);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-xl);
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: var(--space-xl);
}
</style>
