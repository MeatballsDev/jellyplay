# CLAUDE.md — JellyPlay

## Project Overview

**JellyPlay** is a Spotify-lookalike music player built with **Vue 3 + Vite**, connecting to a **Jellyfin** media server's music library.  
Design language: **warm luxury** — beige & dark brown, refined typography, and polished micro-interactions.

---

## Design Skill: frontend-design

Apply the `frontend-design` skill throughout this project. Before writing any component, commit to the following aesthetic direction:

### Aesthetic Direction

- **Tone**: Luxury / refined — warm, tactile, editorial. Think aged leather, linen, and mahogany.
- **Colors** (CSS variables, defined in `src/styles/variables.css`):
  ```css
  --color-bg:           #1a1209;   /* near-black brown */
  --color-surface:      #2b1d0e;   /* dark brown */
  --color-surface-alt:  #3a2715;   /* slightly lighter brown */
  --color-border:       #4e3420;   /* muted brown border */
  --color-accent:       #c9a96e;   /* warm gold-beige */
  --color-accent-soft:  #e8d5b0;   /* light beige */
  --color-text-primary: #f0e6d3;   /* warm off-white */
  --color-text-muted:   #8a7060;   /* muted brown-grey */
  --color-highlight:    #d4a853;   /* amber highlight */
  ```
- **Typography**:
  - Display / headings: `Playfair Display` (serif, editorial weight)
  - Body / UI labels: `DM Sans` (clean, modern, warm)
  - Monospace (EQ values, timestamps): `JetBrains Mono`
  - Import all from Google Fonts in `index.html`
- **Motion**: Subtle easing on route transitions, track switches, and EQ sliders. Use Vue's `<Transition>` and CSS `transition` with `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Differentiation**: The waveform-style equalizer visualizer embedded in the now-playing bar is the hero moment. The sidebar glows subtly on hover using a radial gradient mask.

---

## Folder Structure

```
jellyplay/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js                    # App entry — Vue app init, router, pinia
│   ├── App.vue                    # Root layout: sidebar + main + now-playing bar
│   │
│   ├── styles/
│   │   ├── variables.css          # All CSS custom properties (colors, spacing, fonts)
│   │   ├── reset.css              # Minimal CSS reset
│   │   └── global.css             # Body, scrollbar, selection styles
│   │
│   ├── router/
│   │   └── index.js               # Vue Router — all named routes
│   │
│   ├── stores/
│   │   ├── auth.js                # Pinia: Jellyfin auth token, server URL, user
│   │   ├── player.js              # Pinia: current track, queue, playback state, volume
│   │   ├── library.js             # Pinia: albums, artists, tracks cache
│   │   ├── playlist.js            # Pinia: user-created playlists (persisted)
│   │   └── equalizer.js           # Pinia: EQ band values, presets
│   │
│   ├── api/
│   │   ├── jellyfin.js            # Base axios instance with auth headers
│   │   ├── auth.js                # authenticateByName, getCurrentUser
│   │   ├── library.js             # getArtists, getAlbums, getTracks, search
│   │   ├── stream.js              # getStreamUrl, getAlbumArt
│   │   └── playlists.js           # createPlaylist, addToPlaylist, getPlaylists
│   │
│   ├── composables/
│   │   ├── useAudio.js            # Web Audio API: AudioContext, analyser, EQ nodes
│   │   ├── useSearch.js           # Debounced search, result grouping
│   │   ├── useQueue.js            # Queue management: next, prev, shuffle, repeat
│   │   └── useKeyboard.js         # Global keyboard shortcuts (space, arrows, etc.)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppSidebar.vue     # Nav links, user playlists list, server status dot
│   │   │   ├── AppHeader.vue      # Search bar + user avatar dropdown
│   │   │   └── NowPlayingBar.vue  # Sticky bottom bar: controls, progress, volume, EQ toggle
│   │   │
│   │   ├── player/
│   │   │   ├── PlaybackControls.vue  # Prev / Play-Pause / Next + shuffle + repeat buttons
│   │   │   ├── ProgressBar.vue       # Scrubable seek bar with hover time tooltip
│   │   │   ├── VolumeControl.vue     # Volume slider + mute toggle
│   │   │   └── TrackInfo.vue         # Album art thumbnail, title, artist (marquee on overflow)
│   │   │
│   │   ├── equalizer/
│   │   │   ├── EqualizerPanel.vue    # Slide-up panel: 10-band EQ + preset selector
│   │   │   ├── EQBandSlider.vue      # Single vertical band slider (−12 to +12 dB)
│   │   │   ├── EQVisualizer.vue      # Canvas bar-chart showing live frequency response
│   │   │   └── EQPresets.vue         # Preset pills: Flat, Bass Boost, Vocal, etc.
│   │   │
│   │   ├── library/
│   │   │   ├── AlbumCard.vue         # Grid card: art + title + year + play button on hover
│   │   │   ├── ArtistCard.vue        # Circle photo + name + track count
│   │   │   ├── TrackRow.vue          # Table row: #, title, artist, album, duration, add-to-playlist
│   │   │   └── SectionHeading.vue    # Reusable eyebrow + title heading block
│   │   │
│   │   ├── playlist/
│   │   │   ├── PlaylistCard.vue      # Playlist grid card (user-created)
│   │   │   ├── CreatePlaylistModal.vue # Modal: name input + optional cover color
│   │   │   └── AddToPlaylistMenu.vue   # Dropdown: pick playlist or create new
│   │   │
│   │   ├── search/
│   │   │   ├── SearchBar.vue         # Autofocused input with clear button and shortcut hint
│   │   │   ├── SearchResults.vue     # Grouped results: Tracks / Albums / Artists sections
│   │   │   └── SearchResultRow.vue   # Single result row with type icon and play action
│   │   │
│   │   └── common/
│   │       ├── AppButton.vue         # Themed button (primary / ghost / icon variants)
│   │       ├── AppModal.vue          # Accessible modal wrapper with backdrop
│   │       ├── LoadingSpinner.vue    # Animated warm-tone spinner
│   │       ├── EmptyState.vue        # Illustrated empty state with CTA
│   │       └── ToastNotification.vue # Slide-in toast for actions (added to playlist, etc.)
│   │
│   └── views/
│       ├── LoginView.vue             # Server URL + username + password form
│       ├── HomeView.vue              # Recently played, new releases, recommended
│       ├── LibraryView.vue           # Full album/artist grid with filter tabs
│       ├── AlbumView.vue             # Album detail: art header + track list
│       ├── ArtistView.vue            # Artist detail: bio + discography grid
│       ├── PlaylistView.vue          # Playlist detail: editable track list
│       ├── SearchView.vue            # Full search page with grouped results
│       └── SettingsView.vue          # Server settings, EQ default preset, theme tweaks
│
├── index.html                        # Google Fonts import here
├── vite.config.js
└── package.json
```

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Vue 3 (Composition API) | Reactive, modern, `<script setup>` |
| Build | Vite | Fast HMR, clean config |
| State | Pinia | Official Vue store, devtools support |
| Routing | Vue Router 4 | Named routes, navigation guards |
| HTTP | Axios | Jellyfin REST API calls |
| Audio | Web Audio API (native) | EQ nodes, analyser for visualizer |
| Persistence | `localStorage` via Pinia plugin | Playlists, EQ presets, auth token |
| Fonts | Google Fonts (CDN) | Playfair Display, DM Sans, JetBrains Mono |

---

## Jellyfin API Integration

### Base Setup (`src/api/jellyfin.js`)
```js
// Create axios instance — server URL and token come from auth store
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export function createJellyfinClient() {
  const auth = useAuthStore()
  return axios.create({
    baseURL: auth.serverUrl,
    headers: {
      'X-Emby-Authorization': `MediaBrowser Token="${auth.token}"`,
      'Content-Type': 'application/json',
    }
  })
}
```

### Key Endpoints to implement

| Feature | Endpoint |
|---|---|
| Login | `POST /Users/AuthenticateByName` |
| Current user | `GET /Users/Me` |
| All albums | `GET /Users/{userId}/Items?IncludeItemTypes=MusicAlbum&Recursive=true` |
| All artists | `GET /Artists?userId={userId}` |
| Album tracks | `GET /Users/{userId}/Items?ParentId={albumId}` |
| Search | `GET /Users/{userId}/Items?SearchTerm={q}&IncludeItemTypes=Audio,MusicAlbum,MusicArtist` |
| Stream URL | `{serverUrl}/Audio/{itemId}/stream?static=true&api_key={token}` |
| Album art | `{serverUrl}/Items/{itemId}/Images/Primary?maxWidth=400` |
| Create playlist | `POST /Playlists` |
| Add to playlist | `POST /Playlists/{id}/Items?Ids={itemId}` |

---

## Core Features: Implementation Notes

### 1. Search (`/search`)
- `SearchBar.vue`: debounce 300ms using `useSearch.js` composable
- `SearchView.vue`: groups results into **Tracks**, **Albums**, **Artists** sections
- Keyboard: `/` focuses search globally (`useKeyboard.js`)
- Clicking a track result plays immediately; album/artist navigates to detail view

### 2. Equalizer
- On app mount, `useAudio.js` creates `AudioContext` and chains 10 `BiquadFilterNode`s (type `peaking`, frequencies: 31, 62, 125, 250, 500, 1k, 2k, 4k, 8k, 16k Hz)
- `<audio>` element → `MediaElementSourceNode` → EQ chain → `AnalyserNode` → `destination`
- `EQVisualizer.vue` uses `requestAnimationFrame` + `AnalyserNode.getByteFrequencyData()` to draw canvas bars
- `EqualizerPanel.vue` slides up from `NowPlayingBar` on EQ button click
- Presets stored in `equalizer.js` store, persisted to localStorage

### 3. Playlist Creation
- `playlist.js` store holds user playlists array: `{ id, name, trackIds[], createdAt }`
- On "Add to playlist" (`TrackRow.vue` context menu) → `AddToPlaylistMenu.vue` appears
- `CreatePlaylistModal.vue` opens from sidebar "+" button or from the add menu
- Playlists sync to Jellyfin via `POST /Playlists` on creation; local state is source of truth for UI responsiveness
- `PlaylistView.vue` shows drag-to-reorder track list (Vue native drag events)

---

## Player Architecture (`stores/player.js`)

```js
// State shape
{
  currentTrack: null,       // full track object from Jellyfin
  queue: [],                // ordered array of track objects
  queueIndex: 0,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  shuffleOn: false,
  repeatMode: 'none',       // 'none' | 'one' | 'all'
  currentTime: 0,
  duration: 0,
}
```

The `<audio>` element lives in `NowPlayingBar.vue` and is controlled via the player store's actions. `useAudio.js` holds the Web Audio API graph reference.

---

## Design Rules (enforce in every component)

1. **No white backgrounds** — use `--color-bg` or `--color-surface` always
2. **Hover states** — every interactive element gets a `background` or `color` transition (150ms ease)
3. **Active track** — highlighted in `--color-accent` with left border indicator
4. **Album art** — always `border-radius: 8px`, subtle `box-shadow: 0 4px 20px rgba(0,0,0,0.5)`
5. **Scrollbars** — styled thin, dark, using `::-webkit-scrollbar` in `global.css`
6. **Spacing scale** — use multiples of 4px; define `--space-xs` through `--space-xl` in variables
7. **Sidebar width** — 240px fixed; collapses to icon-only on `< 768px`
8. **NowPlayingBar height** — 88px fixed at bottom; never overlaps content (add `padding-bottom: 88px` to main)

---

## Keyboard Shortcuts (`useKeyboard.js`)

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `←` / `→` | Previous / Next track |
| `↑` / `↓` | Volume up / down |
| `/` | Focus search bar |
| `M` | Toggle mute |
| `E` | Toggle EQ panel |
| `S` | Toggle shuffle |

---

## Getting Started

```bash
npm create vite@latest jellyplay -- --template vue
cd jellyplay
npm install axios pinia vue-router
npm run dev
```

On the **JellyPlay** `LoginView`, user enters their Jellyfin server URL, username, and password. On success, token is persisted in Pinia + localStorage. All subsequent API calls use this token.

---

## Notes for Claude

- Apply the **frontend-design skill** aesthetic direction to every component — no plain grey or white UI elements
- Every new component should feel like part of the same cohesive design system
- Prioritise Web Audio API correctness in `useAudio.js` — EQ must actually affect the audio signal
- Keep Jellyfin API calls in `src/api/` only — views and components call store actions, never the API directly
- All text strings should be in English; no i18n required for v1