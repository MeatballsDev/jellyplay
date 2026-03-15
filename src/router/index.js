import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('@/views/LibraryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/album/:id',
    name: 'album',
    component: () => import('@/views/AlbumView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/artist/:id',
    name: 'artist',
    component: () => import('@/views/ArtistView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/playlist/:id',
    name: 'playlist',
    component: () => import('@/views/PlaylistView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  // Auth store may not be initialized yet during SSR-like init; wrap in try
  try {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      return { name: 'login' }
    }
    if (to.name === 'login' && auth.isLoggedIn) {
      return { name: 'home' }
    }
  } catch {
    // pinia not yet initialized
  }
})

export default router
