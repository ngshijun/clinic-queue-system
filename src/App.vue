<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const patientNumber = ref<number | null>(null)
const patientNumberInput = ref<string>('')
const currentNumber = ref<number>(0) // Initialize with 0 instead of just 0
const estimatedWait = ref<string>('Calculating...')
const isLoading = ref(false)
const lastUpdated = ref<Date | null>(null)
let intervalId: number | null = null

const estimateTime = () => {
  if (patientNumber.value !== null) {
    // If current number is greater than or equal to patient number, their turn has come or passed
    if (currentNumber.value >= patientNumber.value) {
      estimatedWait.value = 'Now'
    } else {
      // Calculate wait time: patient number - current number = people ahead
      const diff = patientNumber.value - currentNumber.value
      const totalMinutes = diff * 5
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      if (hours > 0) {
        estimatedWait.value = `${hours}h ${minutes}m`
      } else {
        estimatedWait.value = `${minutes}m`
      }
    }
  } else {
    estimatedWait.value = 'Calculating...'
  }
}

// Function to fetch current queue number from API
const fetchCurrentNumber = async () => {
  lastUpdated.value = new Date()
  isLoading.value = true

  try {
    // Use Vercel API route instead of direct API call
    const response = await fetch('/api/queue')

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('API Response:', data)

    // Handle the response data - ensure it's a number
    const newCurrentNumber = typeof data.queueNo === 'number' ? data.queueNo : 0

    if (newCurrentNumber !== currentNumber.value) {
      console.log(`Queue updated: ${currentNumber.value} → ${newCurrentNumber}`)
      currentNumber.value = newCurrentNumber
      estimateTime()
    }
  } catch (error) {
    console.error('Error fetching current number:', error)

    // Optional: Show error to user
    // You could add an error state here to display to users
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = () => {
  const numberValue = parseInt(patientNumberInput.value)
  if (!isNaN(numberValue) && numberValue > 0) {
    patientNumber.value = numberValue
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const item = {
      number: numberValue,
      expiry: tomorrow,
    }
    localStorage.setItem('patientNumber', JSON.stringify(item))
    estimateTime()
  }
}

const resetPatientNumber = () => {
  patientNumber.value = null
  patientNumberInput.value = ''
  localStorage.removeItem('patientNumber')
  estimatedWait.value = 'Calculating...'
}

// Set up timer for automatic updates
const startTimer = () => {
  // Fetch immediately
  fetchCurrentNumber()
  // Then set interval for every 30 seconds
  intervalId = setInterval(fetchCurrentNumber, 30000)
}

// Clean up timer
const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Lifecycle hooks
onMounted(() => {
  const stored = localStorage.getItem('patientNumber')
  if (stored) {
    try {
      const item = JSON.parse(stored)
      const now = new Date()
      if (now.getTime() > item.expiry) {
        localStorage.removeItem('patientNumber')
      } else {
        console.log('Patient number:', item.number)
        console.log('Patient number input:', item.number.toString())
        patientNumber.value = item.number
        patientNumberInput.value = item.number.toString()
      }
    } catch (error) {
      console.error('Error parsing stored patient number:', error)
      localStorage.removeItem('patientNumber')
    }
  }
  startTimer()
  lastUpdated.value = new Date()
})

onUnmounted(() => {
  stopTimer()
})

// Format time for display
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Watch for changes in patient number to recalculate wait time
watch([currentNumber, patientNumber], () => {
  if (patientNumber.value !== null) {
    estimateTime()
  }
})

// Helper functions to safely display numbers
const displayCurrentNumber = () => {
  return currentNumber.value?.toString() || '0'
}

const displayPatientNumber = () => {
  return patientNumber.value?.toString() || '0'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6 sm:mb-12">
        <h1 class="text-2xl sm:text-5xl font-bold text-gray-800 mb-2 sm:mb-4 leading-tight">
          🏥 POLIKLINIK NG PLT 黄氏药房
        </h1>
      </div>

      <!-- Patient Number Input Section -->
      <div
        v-if="patientNumber === null"
        class="bg-white rounded-2xl shadow-lg p-8 sm:p-12 mb-4 sm:mb-6 text-center relative overflow-hidden min-h-[400px] flex flex-col justify-center"
      >
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div class="mb-8 sm:mb-10">
          <div class="space-y-2 sm:space-y-3">
            <h2 class="text-xl sm:text-3xl font-semibold text-gray-800">Enter Your Queue Number</h2>
            <h2 class="text-lg sm:text-2xl font-semibold text-gray-700">Masukkan Nombor Giliran Anda</h2>
            <h2 class="text-lg sm:text-2xl font-semibold text-gray-700">输入您的排队号码</h2>
          </div>
        </div>

        <div class="max-w-md mx-auto">
          <div class="mb-6 sm:mb-8">
            <input
              v-model="patientNumberInput"
              type="number"
              placeholder="Eg. 42"
              class="w-full px-6 py-4 sm:px-8 sm:py-5 text-xl sm:text-2xl text-center border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors duration-200"
              @keyup.enter="handleSubmit"
              min="1"
            />
          </div>

          <button
            @click="handleSubmit"
            :disabled="!patientNumberInput || isNaN(parseInt(patientNumberInput)) || parseInt(patientNumberInput) <= 0"
            class="w-full px-6 py-4 sm:px-8 sm:py-5 bg-indigo-600 text-white text-lg sm:text-xl font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div class="space-y-1">
              <div>📋 Submit Queue Number</div>
              <div class="text-sm">Hantar Nombor Giliran | 提交排队号码</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Main Queue Display Card -->
      <div v-else>
        <!-- Current Queue Number Card -->
        <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6 text-center relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="absolute top-3 right-3 sm:top-4 sm:right-4">
            <div class="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
          </div>

          <!-- Current Queue Number -->
          <div class="mb-4 sm:mb-6">
            <div class="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
              <h2 class="text-lg sm:text-2xl font-semibold text-gray-700">Current Queue Number</h2>
              <h2 class="text-base sm:text-xl font-semibold text-gray-600">Nombor Giliran Semasa</h2>
              <h2 class="text-base sm:text-xl font-semibold text-gray-600">当前排队号码</h2>
            </div>

            <div class="relative flex items-center justify-center">
              <div
                class="relative z-10 text-9xl sm:text-9xl font-bold text-indigo-600 transition-all duration-500 ease-in-out"
              >
                {{ displayCurrentNumber() }}
              </div>
            </div>
          </div>

          <!-- Status information -->
          <div
            class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-500"
          >
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates | Kemaskini Langsung | 实时更新</span>
            </div>

            <div v-if="lastUpdated" class="flex items-center space-x-2">
              <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Updated: {{ formatTime(lastUpdated) }}</span>
            </div>
          </div>
        </div>

        <!-- Patient Queue Information Card -->
        <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <!-- Your Number -->
            <div class="text-center">
              <div class="space-y-1 mb-2 sm:mb-3">
                <h3 class="text-base sm:text-lg font-semibold text-gray-700">Your Queue Number</h3>
                <h3 class="text-sm sm:text-base font-semibold text-gray-600">Nombor Giliran Anda</h3>
                <h3 class="text-sm sm:text-base font-semibold text-gray-600">您的排队号码</h3>
              </div>
              <div class="text-8xl sm:text-8xl font-bold text-green-600 mb-2">
                {{ displayPatientNumber() }}
              </div>
              <button
                @click="resetPatientNumber"
                class="text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline transition-colors duration-200"
              >
                Change Number | Tukar Nombor | 更改号码
              </button>
            </div>

            <!-- Wait Time -->
            <div class="text-center">
              <div class="space-y-1 mb-2 sm:mb-3">
                <h3 class="text-base sm:text-lg font-semibold text-gray-700">Estimated Wait Time</h3>
                <h3 class="text-sm sm:text-base font-semibold text-gray-600">Anggaran Masa Menunggu</h3>
                <h3 class="text-sm sm:text-base font-semibold text-gray-600">预计等待时间</h3>
              </div>
              <div class="text-7xl sm:text-7xl font-bold text-orange-600 mb-2">
                {{ estimatedWait }}
              </div>
              <div v-if="patientNumber && currentNumber < patientNumber" class="text-xs sm:text-sm text-gray-500">
                <div>{{ `${patientNumber - currentNumber} people ahead` }}</div>
                <div class="text-xs">{{ `${patientNumber - currentNumber} orang di hadapan` }}</div>
                <div class="text-xs">{{ `前面还有 ${patientNumber - currentNumber} 人` }}</div>
              </div>
            </div>
          </div>

          <!-- Clear Button for when patient's turn has come -->
          <div v-if="patientNumber !== null && patientNumber <= currentNumber" class="mt-6 text-center">
            <button
              @click="resetPatientNumber"
              class="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div class="space-y-1">
                <div>✅ Clear My Number</div>
                <div class="text-sm">Kosongkan Nombor Saya | 清除我的号码</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm px-4">
        <div class="space-y-1">
          <p>© 2025 Poliklinik NG PLT - Queue Management System</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom animations */
@keyframes numberPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Ensure proper text scaling on mobile */
@media (max-width: 640px) {
  .text-6xl,
  .text-8xl {
    line-height: 1.1;
  }
}
</style>