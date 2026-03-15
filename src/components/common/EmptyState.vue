<script setup>
defineProps({
  icon:    { type: String, default: '♪' },
  title:   { type: String, required: true },
  message: { type: String, default: '' },
  cta:     { type: String, default: '' },
})

const emit = defineEmits(['cta'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="message" class="empty-message">{{ message }}</p>
    <button v-if="cta" class="empty-cta" @click="emit('cta')">{{ cta }}</button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-4xl) var(--space-xl);
  text-align: center;
}

.empty-icon {
  font-size: 3.5rem;
  opacity: 0.3;
  line-height: 1;
}

.empty-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--color-text-primary);
}

.empty-message {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: 320px;
}

.empty-cta {
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-accent);
  color: var(--color-bg);
  border-radius: var(--border-radius);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: background var(--duration-base), box-shadow var(--duration-base);
  margin-top: var(--space-sm);
}

.empty-cta:hover {
  background: var(--color-accent-soft);
  box-shadow: var(--shadow-glow);
}
</style>
