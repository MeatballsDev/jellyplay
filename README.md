# JellyPlay

A Spotify-style music player frontend for [Jellyfin](https://jellyfin.org/), built with Vue 3 + Vite. Warm luxury aesthetic — dark browns, gold accents, Playfair Display headings.

## Requirements

- A running Jellyfin server (any version with music library)
- (Optional) [Lidarr](https://lidarr.audio/) for downloading new music

## Deployment

### Portainer (easiest)

Go to **Stacks → Add stack**, paste the following and click **Deploy the stack**:

```yaml
services:
  jellyplay:
    build: https://github.com/MeatballsDev/jellyplay.git
    container_name: jellyplay
    ports:
      - "4949:80"
    restart: unless-stopped
```

App will be available at `http://yourserver:4949`.

To update: pull the latest from git on your server and rebuild, or edit and re-deploy the stack in Portainer.

### Docker Compose (manual)

```bash
git clone https://github.com/MeatballsDev/jellyplay.git
cd jellyplay
docker compose up -d
```

To update after new changes:

```bash
git pull
docker compose up -d --build
```

### Local development

Requires Node.js 18+.

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

On first launch you'll be asked for your Jellyfin server URL, username, and password. Credentials are stored in `localStorage` and never leave your browser.

---

## How it works

### Authentication

Login hits the Jellyfin `/Users/AuthenticateByName` endpoint. On success it stores the access token, server URL, user ID, and username in `localStorage` (keys: `jp_token`, `jp_server`, `jp_userId`, `jp_username`). Every subsequent API call uses these via the auth store (`src/stores/auth.js`). The router guards all routes behind `requiresAuth` and redirects to `/login` if no token is found.

### Audio playback

The `<audio>` element lives in `NowPlayingBar.vue` and is registered in the player store via `setAudioElement()`. All play/pause/seek logic goes through the store — components never touch the element directly.

When the first track loads, `useAudio.js` (`src/composables/useAudio.js`) wires the `<audio>` element into a Web Audio API graph:

```
<audio> → MediaElementSource → EQ band 0 → ... → EQ band 9 → AnalyserNode → GainNode → destination
```

This graph is a module-level singleton — it is created once per app lifetime and reused. It must be initialised after a user gesture to satisfy browser autoplay policy; `initAudioContext()` is called from `onLoadedMetadata` the first time a track loads.

Stream URLs are constructed in `src/api/stream.js` as:
```
{serverUrl}/Audio/{itemId}/stream?static=true&api_key={token}
```
This requests the original file from Jellyfin without transcoding.

### Player store (`src/stores/player.js`)

Central state for everything playback-related:

| State | Description |
|---|---|
| `currentTrack` | The currently loaded track object |
| `queue` | Array of tracks |
| `queueIndex` | Index of the current track in the queue |
| `isPlaying` | Play/pause boolean |
| `shuffleOn` | Persisted to `localStorage` (`jp_shuffle`) |
| `repeatMode` | `'none'` / `'all'` / `'one'`, persisted to `localStorage` (`jp_repeat`) |
| `currentTime` / `duration` | Updated from `<audio>` events |

Key behaviours:
- `next()` stops playback when `repeatMode === 'none'` and the last track finishes. With `repeatMode === 'all'` it wraps around. With shuffle it picks a random index.
- `prev()` restarts the current track if more than 3 seconds have played, otherwise goes to the previous track.
- `moveInQueue(from, insertAt)` handles the index shift correctly when the current track itself is moved.

### Equalizer

10-band peaking EQ at 31 Hz, 62 Hz, 125 Hz, 250 Hz, 500 Hz, 1 kHz, 2 kHz, 4 kHz, 8 kHz, 16 kHz. Each band is a `BiquadFilterNode` with `type: 'peaking'` and Q of 1.4.

Band values (−12 to +12 dB) are stored in the equalizer store (`src/stores/equalizer.js`) and persisted to `localStorage` (`jp_eq_bands`). Built-in presets: Flat, Bass Boost, Treble, Vocal, Classical, Electronic, Rock, Jazz. The EQ panel is toggled from the now-playing bar and slides up from the bottom.

### Queue

The queue is a plain array inside the player store. The queue panel (`src/components/player/QueuePanel.vue`) renders it with drag-to-reorder using mouse events (`mousedown` → `mousemove` on `window` → `mouseup`). A ghost element is teleported to `<body>` so it can follow the cursor outside the panel bounds. A gold drop-line shows the insert position. The panel is a fixed overlay on the right side, mutually exclusive with the EQ panel.

### Library

All library data is fetched from Jellyfin and held in `src/stores/library.js`:

- `albums` / `artists` / `songs` — full library lists, loaded lazily per tab
- `recentAlbums` / `recentArtists` — fetched on home page mount (24 albums, 12 artists sorted by date added)
- `recentlyPlayed` — maintained locally, persisted to `localStorage` (`jp_recent`), max 20 tracks

The Library view (`/library`) has three tabs: Albums, Artists, Songs. Each has sort and filter controls. Songs are loaded lazily when the tab is first opened (up to 5000 tracks). The "All Songs" sidebar link navigates to `/library?tab=songs` which pre-selects the tab on mount.

### Playlists

Playlists are stored entirely in `localStorage` (`jp_playlists`) as JSON — no server sync. Each playlist has an `id`, `name`, `tracks` array (full track objects), and `trackIds` array. Operations: create, rename, delete, add track, remove track, reorder track.

The playlist view uses the same mouse-based drag-to-reorder as the queue panel. A "Shuffle" button enables shuffle mode and starts playback from a random track.

### Search

The search bar in the header updates the `?q=` query param on the search route. `SearchView` watches that param and queries Jellyfin's `/Users/{id}/Items` endpoint with `IncludeItemTypes: 'Audio,MusicAlbum,MusicArtist'`. Results are grouped by type and rendered with `SearchResults.vue`.

If Lidarr is configured, `LidarrResults.vue` also appears below the Jellyfin results, showing artists and albums from the Lidarr/MusicBrainz catalogue (see Lidarr section below).

### Lidarr integration

Configure Lidarr in Settings (`/settings`) — URL, API key, root folder, quality profile, and metadata profile. Settings are persisted to `localStorage` (keys: `ldr_url`, `ldr_key`, `ldr_root`, `ldr_qp`, `ldr_mp`).

Searching works via two parallel requests to the Lidarr API:
- `GET /api/v1/artist/lookup?term=<query>` — artist results
- `GET /api/v1/album/lookup?term=<query>` — direct album results

Clicking an artist in the results expands their discography. Albums are fetched directly from the **MusicBrainz API** (`musicbrainz.org/ws/2/release-group`) rather than Lidarr, to avoid side effects. Cover art comes from the Cover Art Archive (`coverartarchive.org`).

Downloading an album (`src/api/lidarr.js → downloadAlbum`):

1. Check if the artist already exists in Lidarr. If not, add them (unmonitored, no auto-search).
2. Post a `RefreshArtist` command so Lidarr immediately syncs the artist's albums from MusicBrainz (otherwise albums are added asynchronously and may not be visible yet).
3. Poll `GET /api/v1/album?artistId=<id>` every 1.5 seconds (up to 8 retries) until the target album appears.
4. Set the album as monitored via `PUT /api/v1/album/monitor`.
5. Trigger a download search via `POST /api/v1/command { name: 'AlbumSearch' }`.

Downloading an entire artist uses `POST /api/v1/artist` with `monitor: 'all'` and `searchForMissingAlbums: true` — Lidarr handles everything from there.

### Keyboard shortcuts

Handled by `src/composables/useKeyboard.js`, registered globally in `App.vue`. Shortcuts are ignored when focus is inside an input, textarea, or select.

| Key | Action |
|---|---|
| `Space` | Play / pause |
| `←` | Previous track (or restart if >3s played) |
| `→` | Next track |
| `↑` / `↓` | Volume +5% / −5% |
| `M` | Mute toggle |
| `S` | Shuffle toggle |
| `E` | EQ panel toggle |
| `/` | Focus search bar |

---

## Project structure

```
src/
├── api/
│   ├── auth.js          — Jellyfin authentication
│   ├── jellyfin.js      — Axios instance factory (injects auth headers)
│   ├── library.js       — Albums, artists, tracks, search queries
│   ├── lidarr.js        — Lidarr REST API (lookup, add, monitor, search)
│   ├── musicbrainz.js   — MusicBrainz release-group browse + Cover Art Archive
│   ├── playlists.js     — (reserved for server-side playlist sync)
│   └── stream.js        — Stream/image URL builders, duration formatters
├── composables/
│   ├── useAudio.js      — Singleton Web Audio API graph + EQ nodes
│   ├── useKeyboard.js   — Global keyboard shortcut handler
│   ├── useQueue.js      — Queue helper composable
│   └── useSearch.js     — Debounced search composable
├── stores/
│   ├── auth.js          — Token, server URL, user ID
│   ├── equalizer.js     — EQ bands, presets, persistence
│   ├── library.js       — Albums, artists, songs, recently played
│   ├── player.js        — Playback state, queue, shuffle, repeat
│   ├── playlist.js      — Local playlists (localStorage)
│   └── settings.js      — Lidarr connection settings
├── views/
│   ├── LoginView.vue
│   ├── HomeView.vue     — Greeting, recently played, recently added
│   ├── LibraryView.vue  — Albums / Artists / Songs tabs with sort + filter
│   ├── AlbumView.vue    — Album detail + track list
│   ├── ArtistView.vue   — Artist detail + discography
│   ├── PlaylistView.vue — Playlist detail + drag-to-reorder
│   ├── SearchView.vue   — Jellyfin search + Lidarr results
│   └── SettingsView.vue — Lidarr configuration
├── components/
│   ├── layout/          — AppSidebar, AppHeader, NowPlayingBar
│   ├── player/          — PlaybackControls, ProgressBar, VolumeControl, TrackInfo, QueuePanel
│   ├── equalizer/       — EqualizerPanel, EQBandSlider, EQPresets
│   ├── library/         — AlbumCard, ArtistCard, TrackRow, SectionHeading
│   ├── playlist/        — PlaylistCard, CreatePlaylistModal, AddToPlaylistMenu
│   ├── search/          — SearchBar, SearchResults, SearchResultRow, LidarrResults
│   └── common/          — AppButton, AppModal, LoadingSpinner, EmptyState, ToastNotification, TrackContextMenu
└── styles/
    ├── variables.css    — Design tokens (colours, spacing, typography, shadows)
    ├── reset.css        — CSS reset
    └── global.css       — Base element styles
```

## localStorage keys

| Key | Contents |
|---|---|
| `jp_token` | Jellyfin access token |
| `jp_server` | Jellyfin server URL |
| `jp_userId` | Jellyfin user ID |
| `jp_username` | Display username |
| `jp_recent` | Recently played tracks (last 20) |
| `jp_playlists` | All playlists and their tracks |
| `jp_eq_bands` | EQ band values |
| `jp_eq_preset` | Active EQ preset name |
| `jp_shuffle` | Shuffle on/off |
| `jp_repeat` | Repeat mode (`none` / `all` / `one`) |
| `ldr_url` | Lidarr server URL |
| `ldr_key` | Lidarr API key |
| `ldr_root` | Lidarr root folder path |
| `ldr_qp` | Lidarr quality profile ID |
| `ldr_mp` | Lidarr metadata profile ID |
