/**
 * Utility function to make API requests
 */
export async function apiRequest<T = any>(
    url: string,
    options: RequestInit = {},
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        return {
          data: null,
          error: data.error || `Request failed with status ${response.status}`,
        }
      }
  
      return { data, error: null }
    } catch (error) {
      console.error("API request error:", error)
      return {
        data: null,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }
    }
  }
  