<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useQueue } from '../composables/useQueue'
import { useLang } from '../composables/useLang'
import LangSwitcher from '../components/LangSwitcher.vue'

const { t, lang } = useLang()

const patientNumber = ref<number | null>(null)
const patientNumberInput = ref<string>('')

const { currentNumber, error, displayCurrentNumber } = useQueue(30000)

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
    requestNotificationPermission().catch(() => {})
  }
}

const resetPatientNumber = () => {
  patientNumber.value = null
  patientNumberInput.value = ''
  localStorage.removeItem('patientNumber')
}

const maybeNotify = () => {
  if (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    patientNumber.value !== null &&
    currentNumber.value !== null
  ) {
    const remaining = patientNumber.value - currentNumber.value
    if ([5, 3, 1].includes(remaining)) {
      try {
        new Notification(`Poliklinik Ng — ${t.value.yourTurn}`, {
          body: t.value.aheadOfYou(remaining),
          icon: '/clinic.svg',
          tag: 'patient-queue',
        })
      } catch {}
    }
  }
}

const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return Notification.permission === 'granted'
}

onMounted(() => {
  const stored = localStorage.getItem('patientNumber')
  if (stored) {
    try {
      const item = JSON.parse(stored)
      if (new Date().getTime() <= item.expiry) {
        patientNumber.value = item.number
        patientNumberInput.value = item.number.toString()
      } else {
        localStorage.removeItem('patientNumber')
      }
    } catch {
      localStorage.removeItem('patientNumber')
    }
  }
})

watch([currentNumber, patientNumber], () => {
  if (patientNumber.value !== null) {
    maybeNotify()
  }
})
</script>

<template>
  <main class="min-h-screen px-5 pt-3.5 pb-9 sm:pt-7 sm:pb-14 max-w-[680px] mx-auto" :class="{ 'text-cjk-app': lang === 'zh' }">
    <!-- Masthead -->
    <header class="anim-rise">
      <!-- Lang selector, right-aligned -->
      <div class="flex justify-end mb-2.5">
        <LangSwitcher />
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

  </main>
</template>

<style scoped>
.text-cjk-app {
  font-family: var(--font-cjk), var(--font-sans);
}
</style>
