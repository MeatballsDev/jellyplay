<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLibraryStore } from '@/stores/library'
import { getAlbums, getArtists, getAllTracks } from '@/api/library'
import AlbumCard from '@/components/library/AlbumCard.vue'
import ArtistCard from '@/components/library/ArtistCard.vue'
import TrackRow from '@/components/library/TrackRow.vue'
import SectionHeading from '@/components/library/SectionHeading.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route     = useRoute()
const library   = useLibraryStore()
const activeTab = ref(route.query.tab || 'albums')
const sortBy    = ref('name')
const filterQ   = ref('')

// Songs-specific sort (separate from albums sort)
const songSortBy  = ref('name')
const songSortDir = ref('asc')

function setSongSort(col) {
  if (songSortBy.value === col) {
    songSortDir.value = songSortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    songSortBy.value  = col
    songSortDir.value = 'asc'
  }
}

onMounted(async () => {
  if (!library.albums.length) {
    library.isLoadingAlbums = true
    try { library.setAlbums(await getAlbums()) } catch {}
    library.isLoadingAlbums = false
  }
  if (!library.artists.length) {
    library.isLoadingArtists = true
    try { library.setArtists(await getArtists()) } catch {}
    library.isLoadingArtists = false
  }
  if (activeTab.value === 'songs' && !library.songs.length && !library.isLoadingSongs) {
    library.isLoadingSongs = true
    try { library.setSongs(await getAllTracks()) } catch {}
    library.isLoadingSongs = false
  }
})

// Load songs lazily when the tab is first opened
watch(activeTab, async (tab) => {
  if (tab === 'songs' && !library.songs.length && !library.isLoadingSongs) {
    library.isLoadingSongs = true
    try { library.setSongs(await getAllTracks()) } catch {}
    library.isLoadingSongs = false
  }
})

const filteredAlbums = computed(() => {
  let list = library.albums
  if (filterQ.value) {
    const q = filterQ.value.toLowerCase()
    list = list.filter(a => a.Name.toLowerCase().includes(q) || a.AlbumArtist?.toLowerCase().includes(q))
  }
  if (sortBy.value === 'name')   return [...list].sort((a, b) => a.Name.localeCompare(b.Name))
  if (sortBy.value === 'year')   return [...list].sort((a, b) => (b.ProductionYear || 0) - (a.ProductionYear || 0))
  if (sortBy.value === 'artist') return [...list].sort((a, b) => (a.AlbumArtist || '').localeCompare(b.AlbumArtist || ''))
  return list
})

const filteredArtists = computed(() => {
  if (!filterQ.value) return library.artists
  const q = filterQ.value.toLowerCase()
  return library.artists.filter(a => a.Name.toLowerCase().includes(q))
})

const filteredSongs = computed(() => {
  let list = library.songs
  if (filterQ.value) {
    const q = filterQ.value.toLowerCase()
    list = list.filter(s =>
      s.Name.toLowerCase().includes(q) ||
      s.AlbumArtist?.toLowerCase().includes(q) ||
      s.Album?.toLowerCase().includes(q)
    )
  }
  const dir = songSortDir.value === 'asc' ? 1 : -1
  if (songSortBy.value === 'name')   return [...list].sort((a, b) => a.Name.localeCompare(b.Name) * dir)
  if (songSortBy.value === 'artist') return [...list].sort((a, b) => (a.AlbumArtist || '').localeCompare(b.AlbumArtist || '') * dir)
  if (songSortBy.value === 'album')  return [...list].sort((a, b) => (a.Album || '').localeCompare(b.Album || '') * dir)
  return list
})

const tabs = ['albums', 'artists', 'songs']
</script>

<template>
  <div class="library">
    <div class="library-header">
      <SectionHeading eyebrow="Collection" title="Your Library" />

      <div class="controls">
        <input
          v-model="filterQ"
          class="filter-input"
          type="text"
          placeholder="Filter..."
        />

        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </div>

        <select v-if="activeTab === 'albums'" v-model="sortBy" class="sort-select">
          <option value="name">Name</option>
          <option value="year">Year</option>
          <option value="artist">Artist</option>
        </select>
      </div>
    </div>

    <!-- Albums -->
    <template v-if="activeTab === 'albums'">
      <LoadingSpinner v-if="library.isLoadingAlbums" size="lg" />
      <EmptyState
        v-else-if="!filteredAlbums.length"
        icon="◫"
        title="No albums found"
        :message="filterQ ? 'Try a different filter' : 'Connect to your Jellyfin server to see your library'"
      />
      <div v-else class="grid grid--albums">
        <AlbumCard v-for="album in filteredAlbums" :key="album.Id" :album="album" />
      </div>
    </template>

    <!-- Artists -->
    <template v-else-if="activeTab === 'artists'">
      <LoadingSpinner v-if="library.isLoadingArtists" size="lg" />
      <EmptyState
        v-else-if="!filteredArtists.length"
        icon="♟"
        title="No artists found"
      />
      <div v-else class="grid grid--artists">
        <ArtistCard v-for="artist in filteredArtists" :key="artist.Id" :artist="artist" />
      </div>
    </template>

    <!-- Songs -->
    <template v-else>
      <LoadingSpinner v-if="library.isLoadingSongs" size="lg" />
      <EmptyState
        v-else-if="!filteredSongs.length"
        icon="♪"
        title="No songs found"
        :message="filterQ ? 'Try a different filter' : ''"
      />
      <div v-else class="songs-list">
        <div class="songs-header">
          <span></span>
          <button class="col-sort" :class="{ active: songSortBy === 'name' }" @click="setSongSort('name')">
            Title
            <span class="sort-arrow">{{ songSortBy === 'name' ? (songSortDir === 'asc' ? '↑' : '↓') : '' }}</span>
          </button>
          <button class="col-sort" :class="{ active: songSortBy === 'artist' }" @click="setSongSort('artist')">
            Artist
            <span class="sort-arrow">{{ songSortBy === 'artist' ? (songSortDir === 'asc' ? '↑' : '↓') : '' }}</span>
          </button>
          <button class="col-sort" :class="{ active: songSortBy === 'album' }" @click="setSongSort('album')">
            Album
            <span class="sort-arrow">{{ songSortBy === 'album' ? (songSortDir === 'asc' ? '↑' : '↓') : '' }}</span>
          </button>
          <span class="col-label">Duration</span>
          <span></span>
        </div>
        <div class="songs-divider" />
        <TrackRow
          v-for="(track, i) in filteredSongs"
          :key="track.Id"
          :track="track"
          :index="i"
          :queue="filteredSongs"
          :table-layout="true"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.library {
  padding: var(--space-2xl);
  width: 100%;
  box-sizing: border-box;
}

.library-header {
  margin-bottom: var(--space-2xl);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.library-header :deep(.section-heading) {
  margin-bottom: 0;
}

.controls {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.filter-input {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full);
  color: var(--color-text-primary);
  padding: var(--space-xs) var(--space-md);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  outline: none;
  width: 180px;
  transition: border-color var(--duration-base);
}

.filter-input:focus { border-color: var(--color-accent); }
.filter-input::placeholder { color: var(--color-text-muted); }

.tabs {
  display: flex;
  background: var(--color-surface-alt);
  border-radius: var(--border-radius-full);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.tab {
  padding: var(--space-xs) var(--space-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color var(--duration-base), background var(--duration-base);
}

.tab.active {
  background: var(--color-accent);
  color: var(--color-bg);
}

.tab:not(.active):hover {
  color: var(--color-text-primary);
}

.sort-select {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-text-muted);
  padding: var(--space-xs) var(--space-md);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  outline: none;
  cursor: pointer;
}

.grid {
  display: grid;
  gap: var(--space-xl);
}

.grid--albums {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

.grid--artists {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

/* Songs tab */
.songs-list {
  width: 100%;
}

.songs-header {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr auto auto;
  gap: var(--space-md);
  padding: 0 var(--space-md) var(--space-sm);
  align-items: center;
}

.col-sort {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color var(--duration-base);
}

.col-sort:hover {
  color: var(--color-text-primary);
}

.col-sort.active {
  color: var(--color-accent);
}

.sort-arrow {
  font-size: 10px;
  line-height: 1;
}

.col-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.songs-divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: var(--space-sm);
}
</style>
