<script setup>
defineProps({
  eyebrow: String,
  title:   String,
})
</script>

<template>
  <div class="section-heading">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <h2 class="title">{{ title }}</h2>
  </div>
</template>

<style scoped>
.section-heading {
  margin-bottom: var(--space-xl);
}

.eyebrow {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: var(--space-xs);
}

.title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
}
</style>
