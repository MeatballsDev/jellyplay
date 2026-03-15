import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLibraryStore = defineStore('library', () => {
  const albums          = ref([])
  const artists         = ref([])
  const songs           = ref([])
  const recentAlbums    = ref([])
  const recentArtists   = ref([])
  const recentlyPlayed  = ref(JSON.parse(localStorage.getItem('jp_recent') || '[]'))
  const isLoadingAlbums  = ref(false)
  const isLoadingArtists = ref(false)
  const isLoadingSongs   = ref(false)

  function setAlbums(data)  { albums.value  = data }
  function setArtists(data) { artists.value = data }
  function setSongs(data)   { songs.value   = data }

  function setRecentAlbums(data)  { recentAlbums.value  = data }
  function setRecentArtists(data) { recentArtists.value = data }

  function addRecentlyPlayed(track) {
    recentlyPlayed.value = [
      track,
      ...recentlyPlayed.value.filter(t => t.Id !== track.Id),
    ].slice(0, 20)
    localStorage.setItem('jp_recent', JSON.stringify(recentlyPlayed.value))
  }

  return {
    albums, artists, songs, recentAlbums, recentArtists, recentlyPlayed,
    isLoadingAlbums, isLoadingArtists, isLoadingSongs,
    setAlbums, setArtists, setSongs, setRecentAlbums, setRecentArtists, addRecentlyPlayed,
  }
})
