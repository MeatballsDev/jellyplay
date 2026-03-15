<script setup>
import { ref } from 'vue'
import SearchBar from '@/components/search/SearchBar.vue'

const searchRef = ref(null)

defineProps({
  searchRef: Object,
})

defineEmits(['search-focus'])

defineExpose({ focus: () => searchRef.value?.focus() })
</script>

<template>
  <header class="app-header">
    <div class="header-search">
      <SearchBar ref="searchRef" />
    </div>
    <div class="header-hint">
      <kbd>/</kbd> to search
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: 0 var(--space-2xl);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  flex-shrink: 0;
}

.header-search {
  flex: 1;
  max-width: 480px;
}

.header-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

kbd {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: 1px 5px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
