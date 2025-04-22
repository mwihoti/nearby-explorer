// Maximum size for localStorage items (in bytes)
const MAX_STORAGE_SIZE = 2 * 1024 * 1024 // 2MB

// Function to check if localStorage is available
export function isLocalStorageAvailable() {
  try {
    const test = "test"
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

// Function to safely store data in localStorage with size limit
export function safeSetItem(key: string, data: any) {
  try {
    // Convert data to string
    const stringData = JSON.stringify(data)

    // Check size
    if (stringData.length > MAX_STORAGE_SIZE) {
      console.warn(`Data for ${key} exceeds maximum size, not caching`)
      return false
    }

    // Try to set the item
    localStorage.setItem(key, stringData)
    return true
  } catch (e) {
    console.warn(`Error storing data in localStorage: ${e}`)

    // If quota exceeded, clear old items
    if (
      e instanceof DOMException &&
      (e.code === 22 || // Chrome quota exceeded
        e.code === 1014 || // Firefox quota exceeded
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      cleanupStorage()

      // Try again after cleanup
      try {
        localStorage.setItem(key, JSON.stringify(data))
        return true
      } catch (retryError) {
        console.error(`Still unable to store data after cleanup: ${retryError}`)
        return false
      }
    }

    return false
  }
}

// Function to safely get data from localStorage
export function safeGetItem(key: string) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.warn(`Error retrieving data from localStorage: ${e}`)
    return null
  }
}

// Function to clean up old items from localStorage
export function cleanupStorage() {
  try {
    // Get all keys and their timestamps
    const keys = Object.keys(localStorage)
    const keyData = keys.map((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}")
        return {
          key,
          timestamp: data.timestamp || 0,
          size: (localStorage.getItem(key) || "").length,
        }
      } catch (e) {
        return { key, timestamp: 0, size: 0 }
      }
    })

    // Sort by timestamp (oldest first)
    keyData.sort((a, b) => a.timestamp - b.timestamp)

    // Remove oldest items until we've cleared at least 25% of storage
    let clearedSize = 0
    const targetClearSize = MAX_STORAGE_SIZE * 0.25

    for (const item of keyData) {
      // Only remove items that have our timestamp format (to avoid removing other app data)
      if (item.timestamp > 0) {
        localStorage.removeItem(item.key)
        clearedSize += item.size

        if (clearedSize >= targetClearSize) {
          break
        }
      }
    }

    console.log(`Cleaned up ${clearedSize} bytes from localStorage`)
  } catch (e) {
    console.error(`Error cleaning up localStorage: ${e}`)
  }
}

// Function to compress large datasets before storing
export function compressForStorage(data: any[]) {
  // If data is small enough, return as is
  if (data.length <= 20) {
    return data
  }

  // Otherwise, limit to 20 items
  return data.slice(0, 20)
}
