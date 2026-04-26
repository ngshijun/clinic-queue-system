<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useQueue } from '../composables/useQueue'
import { useLang } from '../composables/useLang'
import { subscribeToPush, unsubscribeFromPush, requestPushPermission, pushPermission, pushSupported } from '../composables/usePushSub'
import LangSwitcher from '../components/LangSwitcher.vue'

const { t, lang } = useLang()

const patientNumber = ref<number | null>(null)
const patientNumberInput = ref<string>('')

const { currentNumber, error, displayCurrentNumber } = useQueue(90000)

const positionsAhead = computed(() => {
  if (patientNumber.value === null) return 0
  return Math.max(0, patientNumber.value - currentNumber.value)
})

const isYourTurn = computed(() => {
  return patientNumber.value !== null && currentNumber.value >= patientNumber.value
})

const estimatedWait = computed(() => {
  if (patientNumber.value === null) return '—'
  if (isYourTurn.value) return t.value.now
  const totalMinutes = positionsAhead.value * 5
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours} ${t.value.hours} ${minutes} ${t.value.minutes}` : `${minutes} ${t.value.minutes}`
})

const notifPermission = ref<NotificationPermission>(pushPermission())
const isSubscribed = computed(() => notifPermission.value === 'granted')
const showNotifyButton = computed(() => pushSupported() && notifPermission.value === 'default')
const showNotifyDenied = computed(() => pushSupported() && notifPermission.value === 'denied')

const showBlockedHelp = ref(false)

type Platform = 'iosBrowser' | 'iosPwa' | 'androidPwa' | 'macSafari' | 'chrome' | 'generic'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Mac/.test(ua) && 'ontouchend' in document)
  const isAndroid = /Android/.test(ua)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  if (isIOS && isStandalone) return 'iosPwa'
  if (isIOS) return 'iosBrowser'
  if (isAndroid && isStandalone) return 'androidPwa'
  const isChromium = /Chrome|CriOS|EdgA?|OPR/.test(ua)
  if (isChromium) return 'chrome'
  const isSafari = /Safari/.test(ua) && !isChromium
  if (isSafari) return 'macSafari'
  return 'generic'
}

const blockedSteps = computed<string[]>(() => {
  const platform = detectPlatform()
  return t.value.notifBlocked.steps[platform]
})

const handleSubmit = () => {
  const numberValue = parseInt(patientNumberInput.value)
  if (!isNaN(numberValue) && numberValue > 0) {
    patientNumber.value = numberValue
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    localStorage.setItem(
      'patientNumber',
      JSON.stringify({ number: numberValue, expiry: tomorrow.getTime() }),
    )
    if (notifPermission.value === 'granted') {
      subscribeToPush(numberValue, lang.value).catch(() => {})
    }
  }
}

const handleEnableNotifications = async () => {
  const result = await requestPushPermission()
  notifPermission.value = result
  if (result === 'granted' && patientNumber.value !== null) {
    subscribeToPush(patientNumber.value, lang.value).catch(() => {})
  }
}

const resetPatientNumber = () => {
  const oldNumber = patientNumber.value
  patientNumber.value = null
  patientNumberInput.value = ''
  localStorage.removeItem('patientNumber')
  if (oldNumber !== null) {
    unsubscribeFromPush(oldNumber).catch(() => {})
  }
}

onMounted(() => {
  const stored = localStorage.getItem('patientNumber')
  if (stored) {
    try {
      const item = JSON.parse(stored)
      if (new Date().getTime() <= item.expiry) {
        patientNumber.value = item.number
        patientNumberInput.value = item.number.toString()
        subscribeToPush(item.number, lang.value).catch(() => {})
      } else {
        localStorage.removeItem('patientNumber')
      }
    } catch {
      localStorage.removeItem('patientNumber')
    }
  }
})

watch(lang, (newLang) => {
  if (patientNumber.value !== null) {
    subscribeToPush(patientNumber.value, newLang).catch(() => {})
  }
})
</script>

<template>
  <main class="min-h-screen px-5 pt-3.5 pb-9 sm:pt-7 sm:pb-14 max-w-[680px] mx-auto" :class="{ 'text-cjk-app': lang === 'zh' }">
    <!-- Masthead -->
    <header class="anim-rise">
      <!-- Top controls: notify bell on the left, language on the right -->
      <div class="flex items-center mb-2.5 min-h-[40px]">
        <button
          v-if="patientNumber !== null && showNotifyButton"
          type="button"
          class="notify-chip"
          :aria-label="t.enableNotifications"
          @click="handleEnableNotifications"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <span>{{ t.enableNotifications }}</span>
        </button>
        <button
          v-else-if="patientNumber !== null && showNotifyDenied"
          type="button"
          class="notify-chip-blocked"
          :aria-label="t.notifBlocked.buttonLabel"
          @click="showBlockedHelp = true"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 9.33-4.99"/>
            <path d="M18 8c0 7 3 9 3 9H7"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            <line x1="3" y1="3" x2="21" y2="21"/>
          </svg>
          <span>{{ t.notifBlocked.buttonLabel }}</span>
        </button>
        <span
          v-else-if="patientNumber !== null && isSubscribed"
          class="notify-chip-active"
          :aria-label="t.notificationsActive"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M12 2a6 6 0 0 0-6 6c0 7-3 9-3 9h18s-3-2-3-9a6 6 0 0 0-6-6zM10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <span>{{ t.notificationsActive }}</span>
        </span>
        <LangSwitcher class="ml-auto" />
      </div>

      <div class="double-rule">
        <h1
          class="text-display text-center whitespace-nowrap"
          style="font-size: clamp(1rem, 7vw, 2.6rem); font-weight: 500; font-variation-settings: 'opsz' 72, 'SOFT' 30, 'WONK' 1; letter-spacing: -0.02em;"
        >
          Poliklinik Ng PLT <span class="text-accent">·</span> <span class="text-cjk">黄氏药房</span>
        </h1>
      </div>
    </header>

    <!-- Entry form -->
    <section
      v-if="patientNumber === null"
      class="anim-rise-2 mt-9"
    >
      <div class="rule mb-7">
        <span class="eyebrow-lg">{{ t.enterNumber }}</span>
      </div>

      <div class="mt-2.5 max-w-sm mx-auto">
        <input
          v-model="patientNumberInput"
          type="number"
          inputmode="numeric"
          placeholder="1234"
          class="field-underline w-full text-center"
          style="font-size: clamp(3.2rem, 13vw, 5.5rem);"
          @keyup.enter="handleSubmit"
          min="1"
        />
      </div>

      <div class="mt-9 flex justify-center">
        <button
          @click="handleSubmit"
          :disabled="!patientNumberInput || isNaN(parseInt(patientNumberInput)) || parseInt(patientNumberInput) <= 0"
          class="btn-letterpress"
        >
          {{ t.submit }}
        </button>
      </div>

      <p class="text-center text-lg text-muted-app mt-9 max-w-[38ch] mx-auto leading-relaxed">
        {{ t.savedUntilMidnight }}
      </p>
    </section>

    <!-- Status view -->
    <section v-else class="mt-7">
      <!-- Two-number header: Now calling + Your number side-by-side -->
      <div class="anim-rise">
        <div class="grid grid-cols-[1fr_1fr] gap-0 relative">
          <!-- Now -->
          <div class="text-center pr-4">
            <p class="eyebrow mb-2.5">{{ t.nowCalling }}</p>
            <div class="relative flex items-baseline justify-center">
              <transition name="number-fade" mode="out-in">
                <div
                  :key="displayCurrentNumber()"
                  class="numerals-display"
                  style="font-size: clamp(4.5rem, 22vw, 8rem); font-weight: 500; line-height: 0.88;"
                >
                  {{ displayCurrentNumber() }}
                </div>
              </transition>
            </div>
          </div>

          <!-- Vertical hairline divider -->
          <div
            class="absolute top-8 bottom-0 left-1/2 w-px bg-[var(--color-rule)]"
            aria-hidden="true"
          ></div>

          <!-- Yours -->
          <div class="text-center pl-4">
            <p class="eyebrow mb-2.5 text-accent">{{ t.yourNumber }}</p>
            <div class="relative flex items-baseline justify-center">
              <div
                class="numerals-display"
                style="font-size: clamp(4.5rem, 22vw, 8rem); font-weight: 500; line-height: 0.88; color: var(--color-accent);"
              >
                {{ patientNumber }}
              </div>
            </div>
          </div>
        </div>

        <!-- Positions ahead annotation -->
        <div class="text-center mt-5">
          <p
            v-if="!isYourTurn"
            class="text-display"
            style="font-size: clamp(1.25rem, 4.8vw, 1.6rem); font-variation-settings: 'opsz' 72, 'SOFT' 40, 'WONK' 0;"
          >
            {{ t.aheadOfYou(positionsAhead) }}
          </p>
        </div>
      </div>

      <!-- YOUR TURN state -->
      <div
        v-if="isYourTurn"
        class="anim-rise-2 mt-11 text-center brackets py-14 px-7 bg-surface-app"
      >
        <span class="eyebrow-lg text-moss">{{ t.yourTurn }}</span>
        <p
          class="text-display mt-5"
          style="font-size: clamp(2rem, 7.5vw, 3rem); font-weight: 500; color: var(--color-moss); line-height: 1.15;"
        >
          {{ t.proceedToCounter }}
        </p>
        <div class="mt-9 flex justify-center">
          <button @click="resetPatientNumber" class="btn-letterpress">
            {{ t.clear }}
          </button>
        </div>
      </div>

      <!-- WAIT TIME hero -->
      <div v-else class="anim-rise-2 mt-9 text-center">
        <div class="rule mb-3.5">
          <span class="eyebrow-lg">{{ t.waitTime }}</span>
        </div>

        <p
          class="text-display mt-2.5"
          style="font-size: clamp(3.5rem, 16vw, 6rem); font-weight: 500; line-height: 0.9; font-variation-settings: 'opsz' 144, 'SOFT' 50, 'WONK' 1;"
        >
          {{ estimatedWait }}
        </p>

        <p class="text-lg text-muted-app mt-2.5 font-medium">
          {{ t.approximately }}
        </p>

        <!-- Offline notice (only when connection fails) -->
        <p v-if="error" class="mt-7 text-base text-crimson font-semibold">
          {{ t.offline }}
        </p>

        <!-- Change number -->
        <div class="mt-9 flex justify-center">
          <button @click="resetPatientNumber" class="btn-ghost">
            {{ t.changeNumber }}
          </button>
        </div>
      </div>
    </section>

    <!-- Notifications-blocked help modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showBlockedHelp"
        class="fixed inset-0 z-[998] notif-blocked-backdrop"
        @click="showBlockedHelp = false"
      />
    </Transition>
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-3 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-3 opacity-0"
    >
      <div
        v-if="showBlockedHelp"
        role="dialog"
        aria-modal="true"
        :aria-label="t.notifBlocked.title"
        class="paper-card brackets !fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] w-[min(420px,calc(100vw-2rem))] max-h-[80vh] overflow-y-auto p-6 !shadow-xl"
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="eyebrow !text-[0.6875rem] !font-medium !tracking-[0.22em]" style="color: var(--color-accent)">
            {{ t.notifBlocked.title }}
          </div>
          <button
            class="shrink-0 text-muted-app hover:text-ink text-xl leading-none -mt-1"
            :aria-label="t.close"
            @click="showBlockedHelp = false"
          >×</button>
        </div>
        <p class="text-sm text-ink-2 leading-relaxed mb-4">
          {{ t.notifBlocked.intro }}
        </p>
        <ol class="text-sm text-ink-2 leading-relaxed space-y-2 list-decimal pl-5">
          <li v-for="(step, i) in blockedSteps" :key="i">{{ step }}</li>
        </ol>
        <button class="btn-primary w-full !py-2 text-sm mt-5" @click="showBlockedHelp = false">
          {{ t.close }}
        </button>
      </div>
    </Transition>

  </main>
</template>

<style scoped>
.text-cjk-app {
  font-family: var(--font-cjk), var(--font-sans);
}

.notify-chip,
.notify-chip-active,
.notify-chip-blocked {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  padding: 0.4rem 0.75rem;
  line-height: 1.2;
  min-height: 40px;
}

.notify-chip {
  appearance: none;
  background: transparent;
  border: 1.5px solid var(--color-ink);
  color: var(--color-ink);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.notify-chip:hover,
.notify-chip:focus-visible {
  background: var(--color-ink);
  color: var(--color-paper);
}

.notify-chip-active {
  color: var(--color-moss);
  user-select: none;
  padding-left: 0;
}

.notify-chip-blocked {
  appearance: none;
  background: transparent;
  border: 0;
  color: var(--color-muted);
  cursor: pointer;
  transition: color 0.15s;
  padding-left: 0;
}

.notify-chip-blocked:hover,
.notify-chip-blocked:focus-visible {
  color: var(--color-ink);
}

.notif-blocked-backdrop {
  background: rgba(28, 43, 42, 0.45);
}
</style>
