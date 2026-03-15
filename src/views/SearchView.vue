<script setup>
import { watch, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearch } from '@/composables/useSearch'
import SearchBar from '@/components/search/SearchBar.vue'
import SearchResults from '@/components/search/SearchResults.vue'
import LidarrResults from '@/components/search/LidarrResults.vue'
import SectionHeading from '@/components/library/SectionHeading.vue'

const route    = useRoute()
const router   = useRouter()
const searchBar = ref(null)
const { query, results, isLoading } = useSearch()

onMounted(() => {
  if (route.query.q) query.value = route.query.q
  setTimeout(() => searchBar.value?.focus(), 100)
})

// Sync URL query param
watch(query, (val) => {
  router.replace({ query: val ? { q: val } : {} })
})

function onSearch(val) {
  query.value = val
}
</script>

<template>
  <div class="search-view">
    <SectionHeading eyebrow="Explore" title="Search" />

    <div class="search-input-wrap">
      <SearchBar ref="searchBar" @search="onSearch" />
    </div>

    <div class="results-wrap">
      <SearchResults :results="results" :is-loading="isLoading" :query="query" />
      <LidarrResults :query="query" />

      <div v-if="!query" class="start-hint">
        <p>Start typing to search your library</p>
        <div class="kbd-hints">
          <span><kbd>/</kbd> from anywhere to focus search</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  padding: var(--space-2xl);
  max-width: 800px;
}

.search-view :deep(.section-heading) {
  margin-bottom: var(--space-xl);
}

.search-input-wrap {
  margin-bottom: var(--space-2xl);
}

.results-wrap {
  min-height: 200px;
}

.start-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-3xl);
  color: var(--color-text-muted);
  font-style: italic;
}

.kbd-hints {
  display: flex;
  gap: var(--space-lg);
  font-style: normal;
  font-size: var(--text-xs);
}

kbd {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: 1px 5px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: normal;
}
</style>
