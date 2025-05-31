<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentNumber = ref(0)
const isLoading = ref(false)
const lastUpdated = ref<Date | null>(null)
let intervalId: number | null = null

// Function to fetch current queue number from API
const fetchQueueNumber = async () => {
  isLoading.value = true
  try {
    // Replace this URL with your actual API endpoint
    const response = await fetch('/api/queue/current')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    // Adjust this based on your API response structure
    // Example: { currentNumber: 42 } or { queueNumber: 42 }
    currentNumber.value = data.currentNumber || data.queueNumber || 0
    lastUpdated.value = new Date()
  } catch (err) {
    // For demo purposes - remove this in production
    // Simulate API response with random number
    currentNumber.value = Math.floor(Math.random() * 100) + 1
    lastUpdated.value = new Date()
  } finally {
    isLoading.value = false
  }
}

// Set up timer for automatic updates
const startTimer = () => {
  // Fetch immediately
  fetchQueueNumber()
  // Then set interval for every 30 seconds
  intervalId = setInterval(fetchQueueNumber, 30000)
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
  startTimer()
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

// Manual refresh function
const handleRefresh = () => {
  fetchQueueNumber()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6 sm:mb-12">
        <h1 class="text-2xl sm:text-5xl font-bold text-gray-800 mb-2 sm:mb-4 leading-tight">
          🏥 POLIKLINIK NG 黄氏药房
        </h1>
        <p class="text-sm sm:text-xl text-gray-600">Queue Management System</p>
      </div>

      <!-- Main Queue Display Card -->
      <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6 text-center relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="absolute top-3 right-3 sm:top-4 sm:right-4">
          <div class="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
        </div>

        <!-- Current Queue Number -->
        <div class="mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4">Current Queue Number</h2>

          <div class="relative flex items-center justify-center">
            <!-- Number display -->
            <div
              class="relative z-10 text-8xl sm:text-[10rem] font-bold text-indigo-600 transition-all duration-500 ease-in-out"
            >
              {{ currentNumber.toString().padStart(3, '0') }}
            </div>
          </div>
        </div>

        <!-- Status information -->
        <div
          class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-500"
        >
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
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

      <!-- Control Panel -->
      <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div class="text-xs sm:text-sm text-gray-600 text-center sm:text-left pb-1">
            <p>🔄 Auto-refresh every 30 seconds</p>
            <p>📡 Connected to queue system</p>
          </div>

          <button
            @click="handleRefresh"
            :disabled="isLoading"
            class="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm sm:text-base"
          >
            <span v-if="isLoading">Refreshing...</span>
            <span v-else>🔄 Refresh Now</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm px-4">
        <p>© 2025 Poliklinik NG - Queue Management System</p>
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

.number-display {
  animation: numberPulse 2s ease-in-out infinite;
}

/* Smooth transitions for number changes */
.number-transition {
  transition: all 0.3s ease-in-out;
}

/* Ensure proper text scaling on mobile */
@media (max-width: 640px) {
  .text-6xl {
    line-height: 1.1;
  }
}
</style>
