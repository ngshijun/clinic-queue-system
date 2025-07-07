<script setup lang="ts">
import { useQueue } from '../composables/useQueue'

// Use the queue composable with faster updates for display (15 seconds)
const { isLoading, lastUpdated, error, formatTime, displayCurrentNumber } = useQueue(15000)

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <!-- Main Display Card -->
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden border border-white/30 max-w-4xl w-full">
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

      <!-- Error indicator -->
      <div v-if="error" class="absolute top-6 right-6 sm:top-8 sm:right-8">
        <div class="flex items-center space-x-2 text-red-500 text-sm font-medium">
          <span>⚠️</span>
          <span>Connection Error</span>
        </div>
      </div>

      <!-- Current Queue Number -->
      <div class="mb-8 sm:mb-12">
        <div class="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-800">Current Queue Number</h2>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-800">Nombor Giliran Semasa</h2>
          <h2 class="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-800">当前排队号码</h2>
        </div>

        <!-- The main number display -->
        <div class="relative flex items-center justify-center mb-8">
          <div
            class="relative z-10 text-[18rem] sm:text-[22rem] lg:text-[26rem] font-black text-indigo-600 transition-all duration-500 ease-in-out drop-shadow-lg"
            :class="{ 'animate-pulse': isLoading }"
          >
            {{ displayCurrentNumber() }}
          </div>
          
          <!-- Glowing background effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <!-- Status information -->
      <div class="space-y-4 sm:space-y-6">
        <!-- Live status -->
        <div class="flex justify-center items-center space-x-4 text-lg sm:text-xl text-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse"></div>
            <span class="font-semibold">Live Updates | Kemaskini Langsung | 实时更新</span>
          </div>
        </div>

        <!-- Last updated time -->
        <div v-if="lastUpdated" class="flex justify-center items-center space-x-3 text-base sm:text-lg text-gray-600">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Last Updated: {{ formatTime(lastUpdated) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>