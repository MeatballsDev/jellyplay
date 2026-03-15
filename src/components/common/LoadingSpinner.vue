<script setup>
defineProps({
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
})
</script>

<template>
  <div class="spinner-wrap" :class="`spinner--${size}`">
    <div class="spinner">
      <div v-for="i in 8" :key="i" class="bar" :style="{ '--i': i }" />
    </div>
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.spinner--sm .spinner { width: 24px; height: 24px; }
.spinner--md .spinner { width: 36px; height: 36px; }
.spinner--lg .spinner { width: 52px; height: 52px; }

.spinner {
  position: relative;
}

.bar {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 35%;
  background: var(--color-accent);
  border-radius: 1px;
  transform-origin: bottom center;
  transform: translateX(-50%) rotate(calc(var(--i) * 45deg)) translateY(0);
  animation: spin-bar 0.8s linear infinite;
  animation-delay: calc(var(--i) * -0.1s);
  opacity: 0;
}

@keyframes spin-bar {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
</style>
