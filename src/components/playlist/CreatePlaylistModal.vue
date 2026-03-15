<script setup>
import { ref } from 'vue'
import { usePlaylistStore } from '@/stores/playlist'
import AppModal from '@/components/common/AppModal.vue'

const emit      = defineEmits(['close', 'created'])
const plStore   = usePlaylistStore()
const name      = ref('')
const error     = ref('')
const isLoading = ref(false)

async function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) { error.value = 'Name is required'; return }
  isLoading.value = true
  try {
    const pl = await plStore.createPlaylist(trimmed)
    emit('created', pl)
    emit('close')
  } catch {
    error.value = 'Failed to create playlist'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AppModal title="New Playlist" @close="emit('close')">
    <form class="form" @submit.prevent="submit">
      <label class="label">Playlist name</label>
      <input
        v-model="name"
        class="input"
        type="text"
        placeholder="My playlist..."
        autofocus
        maxlength="100"
      />
      <p v-if="error" class="error">{{ error }}</p>
      <div class="actions">
        <button type="button" class="btn btn--ghost" @click="emit('close')">Cancel</button>
        <button type="submit" class="btn btn--primary" :disabled="isLoading">
          {{ isLoading ? 'Creating…' : 'Create' }}
        </button>
      </div>
    </form>
  </AppModal>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--color-text-primary);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-base);
  font-family: var(--font-body);
  outline: none;
  transition: border-color var(--duration-base);
}

.input:focus {
  border-color: var(--color-accent);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.error {
  color: #e07060;
  font-size: var(--text-xs);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.btn {
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--border-radius);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: background var(--duration-base), color var(--duration-base);
}

.btn--primary {
  background: var(--color-accent);
  color: var(--color-bg);
}

.btn--primary:hover {
  background: var(--color-accent-soft);
}

.btn--ghost {
  color: var(--color-text-muted);
  background: transparent;
}

.btn--ghost:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-alt);
}
</style>
