<script setup>
import { ref } from 'vue'

// Simple singleton toast system — expose show() globally
const toasts = ref([])
let nextId   = 0

function show(message, type = 'info', duration = 3000) {
  const id = ++nextId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

// Expose globally so any component can import and call
defineExpose({ show })

// Register on window for convenience
if (typeof window !== 'undefined') {
  window.$toast = { show }
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: calc(var(--nowplaying-height) + var(--space-lg));
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: center;
  pointer-events: none;
}

.toast {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--border-radius-full);
  font-size: var(--text-sm);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  white-space: nowrap;
}

.toast--success {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.toast--error {
  border-color: #e07060;
  color: #e07060;
}
</style>
