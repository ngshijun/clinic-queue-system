import { ref, onMounted, onUnmounted } from 'vue'

export function useQueue(updateInterval: number = 30000) {
  const currentNumber = ref<number>(0)
  const isLoading = ref(false)
  const lastUpdated = ref<Date | null>(null)
  const error = ref<string | null>(null)
  let intervalId: number | null = null

  // Function to fetch current queue number from API
  const fetchCurrentNumber = async () => {
    lastUpdated.value = new Date()
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/api/queue')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)

      const newCurrentNumber = typeof data.queueNo === 'number' ? data.queueNo : 0

      if (newCurrentNumber !== currentNumber.value) {
        console.log(`Queue updated: ${currentNumber.value} → ${newCurrentNumber}`)
        currentNumber.value = newCurrentNumber
      }
    } catch (err) {
      console.error('Error fetching current number:', err)
      error.value = err instanceof Error ? err.message : 'Failed to fetch queue number'
    } finally {
      isLoading.value = false
    }
  }

  // Set up timer for automatic updates
  const startTimer = () => {
    fetchCurrentNumber()
    intervalId = setInterval(fetchCurrentNumber, updateInterval)
  }

  // Clean up timer
  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // Helper function to safely display the current number
  const displayCurrentNumber = () => {
    return currentNumber.value?.toString() || '0'
  }

  // Auto-start and cleanup
  onMounted(() => {
    startTimer()
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    currentNumber,
    isLoading,
    lastUpdated,
    error,
    fetchCurrentNumber,
    startTimer,
    stopTimer,
    formatTime,
    displayCurrentNumber
  }
}