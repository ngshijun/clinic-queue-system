<script setup lang="ts">
import { onMounted } from 'vue'
import { refreshApp } from './pwa'

onMounted(() => {
  // Lazy-loaded chunk 404s after a deploy mean the user is stranded on stale
  // bundle metadata; reload picks up the new manifest.
  window.addEventListener('vite:preloadError', () => {
    refreshApp()
  })
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>
