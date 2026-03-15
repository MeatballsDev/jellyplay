import { ref, watch } from 'vue'
import { searchItems } from '@/api/library'

export function useSearch() {
  const query     = ref('')
  const results   = ref({ tracks: [], albums: [], artists: [] })
  const isLoading = ref(false)
  const error     = ref(null)

  let timer = null

  watch(query, (val) => {
    clearTimeout(timer)
    error.value = null

    if (!val.trim()) {
      results.value = { tracks: [], albums: [], artists: [] }
      isLoading.value = false
      return
    }

    isLoading.value = true

    timer = setTimeout(async () => {
      try {
        const items = await searchItems(val.trim())
        results.value = {
          tracks:  items.filter(i => i.Type === 'Audio'),
          albums:  items.filter(i => i.Type === 'MusicAlbum'),
          artists: items.filter(i => i.Type === 'MusicArtist'),
        }
      } catch (e) {
        error.value = e.message || 'Search failed'
      } finally {
        isLoading.value = false
      }
    }, 300)
  })

  function clear() {
    query.value   = ''
    results.value = { tracks: [], albums: [], artists: [] }
  }

  return { query, results, isLoading, error, clear }
}
