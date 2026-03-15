import { onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'

export function useKeyboard({ onSearchFocus, onEQToggle } = {}) {
  const player = usePlayerStore()

  function onKeydown(e) {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (document.activeElement?.isContentEditable) return

    switch (e.key) {
      case ' ':
        e.preventDefault()
        player.togglePlay()
        break
      case 'ArrowLeft':
        e.preventDefault()
        player.prev()
        break
      case 'ArrowRight':
        e.preventDefault()
        player.next()
        break
      case 'ArrowUp':
        e.preventDefault()
        player.setVolume(player.volume + 0.05)
        break
      case 'ArrowDown':
        e.preventDefault()
        player.setVolume(player.volume - 0.05)
        break
      case '/':
        e.preventDefault()
        onSearchFocus?.()
        break
      case 'm':
      case 'M':
        player.toggleMute()
        break
      case 'e':
      case 'E':
        onEQToggle?.()
        break
      case 's':
      case 'S':
        player.toggleShuffle()
        break
    }
  }

  onMounted(()   => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
