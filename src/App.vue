<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLang } from './composables/useLang'
import { refreshApp } from './pwa'

const { t } = useLang()
const showUpdateNotice = ref(false)

// "Ask me later" snooze. Suppresses the banner for SNOOZE_MS after the user
// taps ×, so they aren't re-nagged on every focus while mid-task. Persisted
// across reloads so the snooze survives even if the OS evicts the PWA window.
// A genuinely newer deploy after the snooze expires re-surfaces the banner —
// there is no permanent dismiss.
const SNOOZE_KEY = 'web_update_snoozed_until'
const SNOOZE_MS = 60 * 60 * 1000

function reloadPage() { refreshApp() }

function snoozeNotice() {
  try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS)) } catch {}
  showUpdateNotice.value = false
}

onMounted(() => {
  document.addEventListener('plugin_web_update_notice', () => {
    const until = Number(localStorage.getItem(SNOOZE_KEY) ?? '0')
    if (until > Date.now()) return
    showUpdateNotice.value = true
  })
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

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="showUpdateNotice"
        class="paper-card brackets !fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-[min(360px,calc(100vw-3rem))] p-5 !shadow-xl"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="eyebrow !text-[0.6875rem] !font-medium !tracking-[0.22em] mb-1" style="color: var(--color-accent)">
              {{ t.appUpdateTitle }}
            </div>
            <p class="text-sm text-ink-2 leading-relaxed">{{ t.appUpdateDescription }}</p>
          </div>
          <button
            class="shrink-0 text-muted-app hover:text-ink text-lg leading-none -mt-1"
            :aria-label="t.close"
            @click="snoozeNotice"
          >×</button>
        </div>
        <button class="btn-primary w-full !py-2 text-sm mt-4" @click="reloadPage">
          {{ t.appUpdateRefresh }} <span aria-hidden>↻</span>
        </button>
      </div>
    </Transition>
  </div>
</template>
