<script setup>
import SearchResultRow from './SearchResultRow.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

defineProps({
  results:   { type: Object,  required: true },
  isLoading: { type: Boolean, default: false },
  query:     { type: String,  default: '' },
})
</script>

<template>
  <div class="results">
    <LoadingSpinner v-if="isLoading" />

    <template v-else-if="query && (results.tracks.length || results.albums.length || results.artists.length)">
      <!-- Tracks -->
      <section v-if="results.tracks.length" class="section">
        <h3 class="section-title">Tracks</h3>
        <SearchResultRow v-for="item in results.tracks" :key="item.Id" :item="item" />
      </section>

      <!-- Albums -->
      <section v-if="results.albums.length" class="section">
        <h3 class="section-title">Albums</h3>
        <SearchResultRow v-for="item in results.albums" :key="item.Id" :item="item" />
      </section>

      <!-- Artists -->
      <section v-if="results.artists.length" class="section">
        <h3 class="section-title">Artists</h3>
        <SearchResultRow v-for="item in results.artists" :key="item.Id" :item="item" />
      </section>
    </template>

    <div v-else-if="query && !isLoading" class="empty">
      No results for "<strong>{{ query }}</strong>"
    </div>
  </div>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 0 var(--space-md);
  margin-bottom: var(--space-xs);
}

.empty {
  text-align: center;
  padding: var(--space-3xl);
  color: var(--color-text-muted);
  font-style: italic;
}

.empty strong {
  color: var(--color-text-primary);
}
</style>
