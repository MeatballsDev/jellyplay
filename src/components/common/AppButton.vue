<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // 'primary' | 'ghost' | 'icon'
  size:    { type: String, default: 'md' },       // 'sm' | 'md' | 'lg'
  disabled:{ type: Boolean, default: false },
})
</script>

<template>
  <button
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-family: var(--font-body);
  font-weight: 500;
  border-radius: var(--border-radius);
  transition: background var(--duration-base) var(--ease-default),
              color var(--duration-base) var(--ease-default),
              transform var(--duration-fast) var(--ease-default),
              box-shadow var(--duration-base) var(--ease-default);
  cursor: pointer;
  white-space: nowrap;
}

.btn:active:not(:disabled) { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Sizes */
.btn--sm { padding: var(--space-xs) var(--space-md); font-size: var(--text-sm); }
.btn--md { padding: var(--space-sm) var(--space-xl); font-size: var(--text-base); }
.btn--lg { padding: var(--space-md) var(--space-2xl); font-size: var(--text-md); }

/* Variants */
.btn--primary {
  background: var(--color-accent);
  color: var(--color-bg);
}
.btn--primary:hover:not(:disabled) {
  background: var(--color-accent-soft);
  box-shadow: var(--shadow-glow);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
.btn--ghost:hover:not(:disabled) {
  color: var(--color-text-primary);
  background: var(--color-surface-alt);
  border-color: var(--color-accent);
}

.btn--icon {
  background: transparent;
  color: var(--color-text-muted);
  border-radius: 50%;
  padding: var(--space-sm);
}
.btn--icon:hover:not(:disabled) {
  color: var(--color-text-primary);
  background: var(--color-surface-alt);
}
</style>
