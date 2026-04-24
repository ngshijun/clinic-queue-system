<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useQueue } from '../composables/useQueue'

const { isLoading, lastUpdated, error, formatTime, displayCurrentNumber } = useQueue()

const clock = ref<string>('')
let clockTimer: number | null = null

const updateClock = () => {
  const now = new Date()
  clock.value = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

onMounted(() => {
  updateClock()
  clockTimer = window.setInterval(updateClock, 1000 * 15)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<template>
  <main class="min-h-screen flex flex-col">
    <!-- Top masthead -->
    <header class="anim-rise px-12 pt-7 pb-4">
      <div class="flex items-center justify-end mb-4">
        <span class="numerals-display-soft" style="font-size: 1.85rem; font-weight: 500;">
          {{ clock }}
        </span>
      </div>

      <div class="double-rule">
        <h1
          class="text-display text-center"
          style="font-size: clamp(2rem, 4vw, 3.4rem); font-weight: 500; font-variation-settings: 'opsz' 144, 'SOFT' 30, 'WONK' 1;"
        >
          Poliklinik Ng PLT
          <span class="text-accent mx-3">·</span>
          <span class="text-cjk">黄氏药房</span>
        </h1>
      </div>

      <p class="eyebrow text-center mt-3.5" style="font-size: clamp(0.95rem, 1vw, 1.2rem);">
        Queue Display · Paparan Giliran · 叫号显示
      </p>
    </header>

    <!-- Main content: 60/40 split -->
    <section class="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-14 px-10 pb-5">
      <!-- Left: hero number -->
      <div class="anim-rise-2 relative flex flex-col justify-center items-center">
        <div class="text-center mb-6 space-y-1 trilingual-label">
          <p>Now Serving</p>
          <p>Sedang Dilayan</p>
          <p class="text-cjk">正在服务</p>
        </div>

        <div class="relative flex items-center justify-center w-full">
          <transition name="number-fade" mode="out-in">
            <div
              :key="displayCurrentNumber()"
              class="numerals-display text-center"
              style="font-size: clamp(12rem, 25vw, 28rem); font-weight: 500; line-height: 0.82;"
            >
              {{ displayCurrentNumber() }}
            </div>
          </transition>
        </div>

        <!-- Offline notice only when connection fails -->
        <p v-if="error" class="mt-5 eyebrow text-crimson text-center">
          Connection error
        </p>
      </div>

      <!-- Right: join-the-queue card -->
      <aside class="anim-rise-3 flex flex-col justify-center">
        <div class="brackets relative p-8 lg:p-10 bg-surface-app">
          <div class="text-center mb-6 space-y-1.5 trilingual-title">
            <p>Scan to follow the queue</p>
            <p>Imbas untuk ikut giliran</p>
            <p class="text-cjk">扫码跟踪排队</p>
          </div>

          <div class="flex justify-center">
            <div class="p-3.5 bg-paper border-[1.5px] border-[var(--color-ink)]">
              <img
                src="../assets/images/qrcode.svg"
                alt="QR code"
                class="block"
                style="width: clamp(250px, 25vw, 410px); height: auto; filter: contrast(1.1);"
              />
            </div>
          </div>
        </div>
      </aside>
    </section>

  </main>
</template>

<style scoped>
/* Trilingual labels stacked above the hero number — all three languages
   share the same size/weight so none is visually prioritised. */
.trilingual-label p {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: clamp(1.1rem, 1.4vw, 1.6rem);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-2);
  line-height: 1.2;
}

.trilingual-title p {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: clamp(1.25rem, 1.6vw, 1.8rem);
  letter-spacing: 0.02em;
  color: var(--color-ink);
  line-height: 1.3;
}
</style>
