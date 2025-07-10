<script setup lang="ts">
import { useQueue } from '../composables/useQueue'
// Use the queue composable with faster updates for display (15 seconds)
const { isLoading, lastUpdated, error, formatTime, displayCurrentNumber } = useQueue()
</script>

<template>
<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
  <!-- Container for both components -->
  <div class="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl w-full">
    
    <!-- Left Component - Main Queue Display -->
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden border border-white/30 flex-1">
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      
      <!-- Error indicator -->
      <div v-if="error" class="absolute top-6 right-6 sm:top-8 sm:right-8">
        <div class="flex items-center space-x-2 text-red-500 text-sm font-medium">
          <span>⚠️</span>
          <span>Connection Error</span>
        </div>
      </div>
      
      <!-- Current Queue Number -->
      <div class="mb-6 sm:mb-8">
        <div class="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Current Queue Number</h2>
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Nombor Giliran Semasa</h2>
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">当前排队号码</h2>
        </div>
        
        <!-- The main number display -->
        <div class="relative flex items-center justify-center mb-6">
          <div
            class="relative z-10 text-[8rem] sm:text-[12rem] lg:text-[16rem] font-black text-indigo-600 transition-all duration-500 ease-in-out drop-shadow-lg"
            :class="{ 'animate-pulse': isLoading }"
          >
            {{ displayCurrentNumber() }}
          </div>
          <!-- Glowing background effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        </div>
      </div>
      
      <!-- Status information -->
      <div class="space-y-3 sm:space-y-4">
        <!-- Live status -->
        <div class="flex justify-center items-center space-x-4 text-base sm:text-lg text-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse"></div>
            <span class="font-semibold">Live Updates | Kemaskini Langsung | 实时更新</span>
          </div>
        </div>
        
        <!-- Last updated time -->
        <div v-if="lastUpdated" class="flex justify-center items-center space-x-3 text-sm sm:text-base text-gray-600">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <!-- Right Component - QR Code Display -->
    <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden border border-white/30 flex-1">
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
      
      <!-- QR Code Section -->
      <div class="mb-6 sm:mb-8">
        <div class="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Scan for Updates</h2>
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Imbas untuk Kemaskini</h2>
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">扫描获取更新</h2>
        </div>
        
        <!-- QR Code Display -->
        <div class="relative flex items-center justify-center mb-6">
          <div class="relative z-10 bg-white p-6 rounded-2xl shadow-lg">
            <!-- QR Code placeholder - replace with actual QR code component -->
            <div class="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
              <img src="../assets/images/qrcode.svg" alt="QR Code" class="w-full h-full object-contain">
            </div>
          </div>
          <!-- Glowing background effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>
        </div>
      </div>
      
      <!-- Instructions -->
      <div class="space-y-3 sm:space-y-4">
        <div class="text-sm sm:text-base text-gray-600 space-y-2">
          <p class="font-medium">Scan to get real-time queue updates on your device</p>
          <p class="font-medium">Imbas untuk mendapat kemaskini giliran secara langsung</p>
          <p class="font-medium">扫描二维码在您的设备上获取实时队列更新</p>
        </div>
      </div>
    </div>
    
  </div>
</div>
</template>

<style scoped>
</style>