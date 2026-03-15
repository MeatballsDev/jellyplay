<script setup>
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { lookupArtists, lookupAlbums, downloadArtist, downloadAlbum } from '@/api/lidarr'
import { getArtistAlbums, coverArtUrl } from '@/api/musicbrainz'

const props = defineProps({
  query: { type: String, default: '' },
})

const settings = useSettingsStore()

const artists   = ref([])
const albums    = ref([])
const isLoading = ref(false)
const error     = ref(null)

// Expanded artist → their albums
const expandedArtistId = ref(null)
const expandedArtist   = ref(null)
const artistAlbums     = ref([])
const loadingArtist    = ref(false)

// Per-item download state
const dlState = ref({})

let timer = null

watch(() => props.query, (val) => {
  clearTimeout(timer)
  error.value          = null
  artists.value        = []
  albums.value         = []
  dlState.value        = {}
  expandedArtistId.value = null
  expandedArtist.value   = null
  artistAlbums.value     = []

  if (!val.trim() || !settings.isConfigured()) return

  isLoading.value = true
  timer = setTimeout(async () => {
    try {
      const [ar, al] = await Promise.all([
        lookupArtists(val.trim()),
        lookupAlbums(val.trim()),
      ])
      artists.value = ar.slice(0, 6)
      albums.value  = al.slice(0, 8)
    } catch (e) {
      error.value = e.response?.data?.message || 'Lidarr lookup failed'
    } finally {
      isLoading.value = false
    }
  }, 400)
})

async function toggleArtist(artist) {
  if (expandedArtistId.value === artist.foreignArtistId) {
    expandedArtistId.value = null
    expandedArtist.value   = null
    artistAlbums.value     = []
    return
  }
  expandedArtistId.value = artist.foreignArtistId
  expandedArtist.value   = artist
  artistAlbums.value     = []
  loadingArtist.value = true
  try {
    // Query MusicBrainz directly — no Lidarr side effects
    artistAlbums.value = await getArtistAlbums(artist.foreignArtistId)
  } catch {
    artistAlbums.value = []
  } finally {
    loadingArtist.value = false
  }
}

async function triggerDownloadArtist(e, artist) {
  e.stopPropagation()
  const key = 'artist-' + artist.foreignArtistId
  dlState.value[key] = 'loading'
  try {
    await downloadArtist(artist)
    dlState.value[key] = 'done'
  } catch {
    dlState.value[key] = 'error'
    setTimeout(() => { dlState.value[key] = null }, 3000)
  }
}

async function triggerDownloadAlbum(album) {
  const key = 'album-' + album.foreignAlbumId
  dlState.value[key] = 'loading'
  try {
    await downloadAlbum(album)
    dlState.value[key] = 'done'
  } catch {
    dlState.value[key] = 'error'
    setTimeout(() => { dlState.value[key] = null }, 3000)
  }
}

// MB release group → Lidarr-compatible object for downloadAlbum
function mbToLidarr(mbAlbum, artist) {
  return {
    foreignAlbumId: mbAlbum.id,
    title:          mbAlbum.title,
    artist: {
      foreignArtistId: artist.foreignArtistId,
      artistName:      artist.artistName,
    },
  }
}

async function triggerDownloadMbAlbum(mbAlbum, artist) {
  const key = 'mb-' + mbAlbum.id
  dlState.value[key] = 'loading'
  try {
    await downloadAlbum(mbToLidarr(mbAlbum, artist))
    dlState.value[key] = 'done'
  } catch {
    dlState.value[key] = 'error'
    setTimeout(() => { dlState.value[key] = null }, 3000)
  }
}

function artistImage(artist) {
  const img = artist.images?.find(i => i.coverType === 'poster') || artist.images?.[0]
  return img?.remoteUrl || img?.url || null
}

function albumCover(album) {
  const img = album.images?.find(i => i.coverType === 'cover') || album.images?.[0]
  return img?.remoteUrl || img?.url || null
}

function releaseYear(album) {
  // Lidarr format: releaseDate. MusicBrainz format: first-release-date
  const d = album.releaseDate || album['first-release-date']
  return d ? new Date(d).getFullYear() : ''
}

function dlLabel(key, labels) {
  return labels[dlState.value[key]] || labels.idle
}
</script>

<template>
  <div v-if="settings.isConfigured() && query" class="lidarr-section">

    <div class="lidarr-header">
      <span class="lidarr-title">Find New Music</span>
      <span class="lidarr-badge">Lidarr</span>
    </div>

    <div v-if="isLoading" class="status-row">
      <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Searching Lidarr…
    </div>

    <div v-else-if="error" class="status-row error">{{ error }}</div>
    <div v-else-if="!artists.length && !albums.length" class="status-row">No results found on Lidarr</div>

    <template v-else>

      <!-- ── Artists ── -->
      <template v-if="artists.length">
        <div class="sub-heading">Artists</div>
        <div class="results-list">
          <template v-for="artist in artists" :key="artist.foreignArtistId">

            <!-- Artist row -->
            <div
              class="result-row artist-row"
              :class="{ expanded: expandedArtistId === artist.foreignArtistId }"
              @click="toggleArtist(artist)"
            >
              <div class="row-art round">
                <img v-if="artistImage(artist)" :src="artistImage(artist)" :alt="artist.artistName" />
                <div v-else class="art-fallback">♪</div>
              </div>
              <div class="row-info">
                <span class="row-primary">{{ artist.artistName }}</span>
                <span class="row-secondary">{{ artist.genres?.slice(0, 2).join(', ') || 'Artist' }}</span>
              </div>
              <div class="row-actions">
                <button
                  class="dl-btn"
                  :class="dlState['artist-' + artist.foreignArtistId]"
                  :disabled="dlState['artist-' + artist.foreignArtistId] === 'loading' || dlState['artist-' + artist.foreignArtistId] === 'done'"
                  :title="dlLabel('artist-' + artist.foreignArtistId, { idle: 'Add all albums', loading: 'Adding…', done: 'Added', error: 'Failed' })"
                  @click="triggerDownloadArtist($event, artist)"
                >
                  <svg v-if="dlState['artist-' + artist.foreignArtistId] === 'loading'" class="spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <svg v-else-if="dlState['artist-' + artist.foreignArtistId] === 'done'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else-if="dlState['artist-' + artist.foreignArtistId] === 'error'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {{ dlLabel('artist-' + artist.foreignArtistId, { idle: 'Add All', loading: 'Adding…', done: 'Added', error: 'Failed' }) }}
                </button>
                <!-- Chevron -->
                <svg
                  class="chevron"
                  :class="{ open: expandedArtistId === artist.foreignArtistId }"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <!-- Expanded album list -->
            <Transition name="expand">
              <div
                v-if="expandedArtistId === artist.foreignArtistId"
                class="artist-albums"
              >
                <div v-if="loadingArtist" class="albums-loading">
                  <svg class="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Loading albums…
                </div>
                <div v-else-if="!artistAlbums.length" class="albums-empty">No albums found</div>
                <div
                  v-else
                  v-for="album in artistAlbums"
                  :key="album.id"
                  class="album-row"
                >
                  <div class="album-art">
                    <img
                      :src="coverArtUrl(album.id)"
                      :alt="album.title"
                      @error="e => e.target.style.display = 'none'"
                    />
                    <div class="art-fallback small">♪</div>
                  </div>
                  <div class="row-info">
                    <span class="row-primary">{{ album.title }}</span>
                    <span class="row-secondary">{{ releaseYear(album) }}</span>
                  </div>
                  <button
                    class="dl-btn small"
                    :class="dlState['mb-' + album.id]"
                    :disabled="dlState['mb-' + album.id] === 'loading' || dlState['mb-' + album.id] === 'done'"
                    @click.stop="triggerDownloadMbAlbum(album, expandedArtist)"
                  >
                    <svg v-if="dlState['mb-' + album.id] === 'loading'" class="spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    <svg v-else-if="dlState['mb-' + album.id] === 'done'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="dlState['mb-' + album.id] === 'error'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    {{ dlLabel('mb-' + album.id, { idle: 'Get', loading: '…', done: '✓', error: '✗' }) }}
                  </button>
                </div>
              </div>
            </Transition>

          </template>
        </div>
      </template>

      <!-- ── Direct album results ── -->
      <template v-if="albums.length">
        <div class="sub-heading">Albums</div>
        <div class="results-list">
          <div v-for="album in albums" :key="album.foreignAlbumId" class="result-row">
            <div class="row-art">
              <img v-if="albumCover(album)" :src="albumCover(album)" :alt="album.title" />
              <div v-else class="art-fallback">♪</div>
            </div>
            <div class="row-info">
              <span class="row-primary">{{ album.title }}</span>
              <span class="row-secondary">{{ album.artist?.artistName }}{{ releaseYear(album) ? ' · ' + releaseYear(album) : '' }}</span>
            </div>
            <button
              class="dl-btn"
              :class="dlState['album-' + album.foreignAlbumId]"
              :disabled="dlState['album-' + album.foreignAlbumId] === 'loading' || dlState['album-' + album.foreignAlbumId] === 'done'"
              @click="triggerDownloadAlbum(album)"
            >
              <svg v-if="dlState['album-' + album.foreignAlbumId] === 'loading'" class="spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <svg v-else-if="dlState['album-' + album.foreignAlbumId] === 'done'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="dlState['album-' + album.foreignAlbumId] === 'error'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {{ dlLabel('album-' + album.foreignAlbumId, { idle: 'Download', loading: 'Queuing…', done: 'Queued', error: 'Failed' }) }}
            </button>
          </div>
        </div>
      </template>

    </template>
  </div>
</template>

<style scoped>
.lidarr-section {
  margin-top: var(--space-2xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.lidarr-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.lidarr-title {
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-muted);
}

.lidarr-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-accent);
  background: var(--color-accent-dim);
  border: 1px solid rgba(201, 169, 110, 0.25);
  border-radius: var(--border-radius-full);
  padding: 2px var(--space-sm);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sub-heading {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 var(--space-md);
  margin-bottom: var(--space-xs);
  margin-top: var(--space-md);
}

.status-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  padding: var(--space-md);
  font-style: italic;
}
.status-row.error { color: #e07060; font-style: normal; }

.results-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: var(--space-sm); }

/* ── Rows ── */
.result-row {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--border-radius);
  transition: background var(--duration-fast);
}
.result-row:hover { background: var(--color-surface-alt); }

.artist-row {
  cursor: pointer;
  user-select: none;
}
.artist-row.expanded { background: var(--color-surface-alt); }

/* ── Art ── */
.row-art {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}
.row-art img {
  width: 44px;
  height: 44px;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
}
.row-art.round img,
.row-art.round .art-fallback { border-radius: 50%; }

.art-fallback {
  width: 44px;
  height: 44px;
  border-radius: var(--border-radius-sm);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.art-fallback.small { width: 36px; height: 36px; }

/* ── Info ── */
.row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.row-primary {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-secondary {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Artist actions ── */
.row-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.chevron {
  color: var(--color-text-muted);
  transition: transform var(--duration-base) var(--ease-default);
  flex-shrink: 0;
}
.chevron.open { transform: rotate(180deg); }

/* ── Expanded album panel ── */
.artist-albums {
  background: var(--color-bg);
  border-left: 2px solid var(--color-border);
  margin: 0 var(--space-md) var(--space-xs) calc(44px + var(--space-md) * 2);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  overflow: hidden;
}

.albums-loading,
.albums-empty {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.album-row {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  transition: background var(--duration-fast);
}
.album-row:hover { background: var(--color-surface-alt); }

.album-art {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  position: relative;
}
.album-art img {
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
  position: relative;
  z-index: 1;
}
.album-art .art-fallback.small {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* ── Download button ── */
.dl-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--border-radius);
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: var(--font-body);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: var(--color-surface-alt);
  white-space: nowrap;
  flex-shrink: 0;
  transition: color var(--duration-base), border-color var(--duration-base), background var(--duration-base);
}
.dl-btn.small {
  padding: 3px var(--space-sm);
}
.dl-btn:not(:disabled):hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-dim);
}
.dl-btn.done { color: #6dbf8a; border-color: rgba(109,191,138,0.3); background: rgba(109,191,138,0.08); }
.dl-btn.error { color: #e07060; border-color: rgba(224,112,96,0.3); }

/* ── Expand transition ── */
.expand-enter-active,
.expand-leave-active {
  transition: max-height var(--duration-slow) var(--ease-default), opacity var(--duration-base);
  max-height: 800px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
