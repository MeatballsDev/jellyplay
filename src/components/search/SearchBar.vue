<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit   = defineEmits(['search'])
const router = useRouter()

const query   = ref('')
const inputEl = ref(null)

function onInput() {
  emit('search', query.value)
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    query.value = ''
    inputEl.value?.blur()
  }
  if (e.key === 'Enter') {
    router.push({ name: 'search', query: { q: query.value } })
  }
}

function clear() {
  query.value = ''
  emit('search', '')
  inputEl.value?.focus()
}

defineExpose({ focus: () => inputEl.value?.focus() })
</script>

<template>
  <div class="search-bar">
    <svg class="icon-search" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>

    <input
      ref="inputEl"
      v-model="query"
      class="input"
      type="text"
      placeholder="Search music..."
      spellcheck="false"
      @input="onInput"
      @keydown="onKeydown"
    />

    <button v-if="query" class="clear-btn" @click="clear">✕</button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-full);
  padding: var(--space-sm) var(--space-md);
  transition: border-color var(--duration-base), box-shadow var(--duration-base);
}

.search-bar:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-dim);
}

.icon-search {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-body);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.clear-btn {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  padding: 2px 4px;
  border-radius: var(--border-radius-sm);
  transition: color var(--duration-base);
}

.clear-btn:hover {
  color: var(--color-text-primary);
}
</style>
