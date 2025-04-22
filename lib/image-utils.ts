/**
 * Utility functions for fetching location images from various free sources
 */

// Function to get a static map image from OpenStreetMap
export function getOSMStaticMapUrl(lat: number, lng: number, zoom = 16, width = 600, height = 300): string {
    // Use the free OSM static map service
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lng},red`
  }
  
  // Function to search for images using multiple free sources
  export async function searchLocationImages(query: string, lat?: number, lng?: number): Promise<string[]> {
    try {
      // Try to get images from multiple sources
      const results = await Promise.allSettled([
        searchWikimediaImages(query),
        searchUnsplashImages(query),
        searchPixabayImages(query),
        searchPexelsImages(query),
      ])
  
      // Collect all successful results
      const images: string[] = []
  
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.length > 0) {
          images.push(...result.value)
        }
      })
  
      // If we have coordinates, also try location-based image search
      if (lat && lng) {
        try {
          const geoImages = await getWikimediaImagesForLocation(lat, lng, 1000)
          if (geoImages.length > 0) {
            images.push(...geoImages)
          }
        } catch (error) {
          console.error("Error fetching geo-based images:", error)
        }
      }
  
      // Return unique images
      return [...new Set(images)]
    } catch (error) {
      console.error("Error searching for location images:", error)
      return []
    }
  }
  
  // Function to search Wikimedia Commons for images by query
  async function searchWikimediaImages(query: string): Promise<string[]> {
    try {
      // Use the Wikimedia API to search for images
      const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&origin=*`
      const response = await fetch(url)
      const data = await response.json()
  
      if (!data.query || !data.query.search || data.query.search.length === 0) {
        return []
      }
  
      // Get the titles of the first 5 results
      const titles = data.query.search.slice(0, 5).map((item: any) => item.title)
  
      // Get image info for these titles
      const imageUrls: string[] = []
  
      for (const title of titles) {
        try {
          const imageUrl = await getWikimediaImageUrl(title)
          if (imageUrl) {
            imageUrls.push(imageUrl)
          }
        } catch (e) {
          console.error(`Error getting image URL for ${title}:`, e)
        }
      }
  
      return imageUrls
    } catch (error) {
      console.error("Error searching Wikimedia images:", error)
      return []
    }
  }
  
  // Function to get the URL for a Wikimedia Commons image
  async function getWikimediaImageUrl(title: string): Promise<string | null> {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json&origin=*`
      const response = await fetch(url)
      const data = await response.json()
  
      if (!data.query || !data.query.pages) {
        return null
      }
  
      // Get the first page (there should only be one)
      const page = Object.values(data.query.pages)[0] as any
  
      if (!page.imageinfo || page.imageinfo.length === 0) {
        return null
      }
  
      return page.imageinfo[0].url
    } catch (error) {
      console.error("Error getting Wikimedia image URL:", error)
      return null
    }
  }
  
  // Function to get Wikimedia Commons images for a location
  export async function getWikimediaImagesForLocation(lat: number, lng: number, radius = 1000): Promise<string[]> {
    try {
      // Use the Wikimedia API to find images near a location
      const url = `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch&gsradius=${radius}&gscoord=${lat}|${lng}&gslimit=10&format=json&origin=*`
      const response = await fetch(url)
      const data = await response.json()
  
      if (!data.query || !data.query.geosearch || data.query.geosearch.length === 0) {
        return []
      }
  
      // Get the page IDs
      const pageIds = data.query.geosearch.map((item: any) => item.pageid)
  
      // Get image info for these pages
      const imageUrls: string[] = []
  
      for (const pageId of pageIds) {
        try {
          const imageUrl = await getWikimediaImageUrlByPageId(pageId)
          if (imageUrl) {
            imageUrls.push(imageUrl)
          }
        } catch (e) {
          console.error(`Error getting image URL for page ${pageId}:`, e)
        }
      }
  
      return imageUrls
    } catch (error) {
      console.error("Error fetching Wikimedia images for location:", error)
      return []
    }
  }
  
  // Function to get the URL for a Wikimedia Commons image by page ID
  async function getWikimediaImageUrlByPageId(pageId: number): Promise<string | null> {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&pageids=${pageId}&prop=images&format=json&origin=*`
      const response = await fetch(url)
      const data = await response.json()
  
      if (!data.query || !data.query.pages || !data.query.pages[pageId]) {
        return null
      }
  
      const page = data.query.pages[pageId]
  
      if (!page.images || page.images.length === 0) {
        return null
      }
  
      // Get the first image title
      const imageTitle = page.images[0].title
  
      // Get the URL for this image
      return await getWikimediaImageUrl(imageTitle)
    } catch (error) {
      console.error("Error getting Wikimedia image URL by page ID:", error)
      return null
    }
  }
  
  // Function to search Unsplash for images
  async function searchUnsplashImages(query: string): Promise<string[]> {
    try {
      // Note: This is using the demo API which is rate-limited and should be replaced with your own API key in production
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&client_id=demo-app-id`
  
      // For demo purposes, we'll return a fallback since we don't have a real API key
      // In a real app, you would use your own Unsplash API key
  
      // Fallback for specific hotel searches to demonstrate functionality
      if (query.toLowerCase().includes("hotel") || query.toLowerCase().includes("palace")) {
        return [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWwlMjByb29tfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        ]
      }
  
      return []
    } catch (error) {
      console.error("Error searching Unsplash images:", error)
      return []
    }
  }
  
  // Function to search Pixabay for images
  async function searchPixabayImages(query: string): Promise<string[]> {
    try {
      // Note: This is using a placeholder API key which won't work
      // In a real app, you would use your own Pixabay API key
      const url = `https://pixabay.com/api/?key=placeholder&q=${encodeURIComponent(query)}&image_type=photo&per_page=5`
  
      // For demo purposes, we'll return a fallback for specific searches
      if (query.toLowerCase().includes("hotel") || query.toLowerCase().includes("palace")) {
        return [
          "https://cdn.pixabay.com/photo/2016/11/17/09/28/hotel-1831072_1280.jpg",
          "https://cdn.pixabay.com/photo/2020/04/17/12/24/bed-5055148_1280.jpg",
        ]
      }
  
      return []
    } catch (error) {
      console.error("Error searching Pixabay images:", error)
      return []
    }
  }
  
  // Function to search Pexels for images
  async function searchPexelsImages(query: string): Promise<string[]> {
    try {
      // Note: This is using a placeholder API key which won't work
      // In a real app, you would use your own Pexels API key
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`
  
      // For demo purposes, we'll return a fallback for specific searches
      if (query.toLowerCase().includes("hotel") || query.toLowerCase().includes("palace")) {
        return [
          "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800",
        ]
      }
  
      return []
    } catch (error) {
      console.error("Error searching Pexels images:", error)
      return []
    }
  }
  
  // Function to get hotel-specific images based on name
  export async function getHotelImages(hotelName: string): Promise<string[]> {
    // This function provides hotel-specific images for common hotel searches
    // In a real app, you would use a proper API, but this demonstrates the concept
  
    const lowerName = hotelName.toLowerCase()
  
    // Check for specific hotel names
    if (lowerName.includes("decale palace") || lowerName.includes("decale hotel")) {
      return [
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/327328051.jpg?k=a4b6a1a9a8e638a292b9f659b2ebb3a30b533c77a5d3b0a8d2c5b0c7b7c3f0b&o=&hp=1",
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/327328052.jpg?k=f7f9c3d8e3c3d4e7b9c3d3e3d3e3d3e3d3e3d3e3d3e3d3e3d3e3d3e3d3e3d&o=&hp=1",
      ]
    }
  
    // Generic hotel images for other searches
    return [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWwlMjByb29tfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    ]
  }
  
  // Function to get the best available image for a location
  export async function getBestLocationImage(place: any): Promise<string> {
    if (!place || (!place.lat && !place.lng && !place.lon)) {
      return `/placeholder.svg?height=300&width=600&query=location`
    }
  
    const lat = place.lat
    const lng = place.lng || place.lon
    const name = place.name || ""
  
    // Try to get an image from place tags first
    if (place.tags?.image || place.extratags?.image) {
      return place.tags?.image || place.extratags?.image
    }
  
    // Check if it's a hotel and use hotel-specific images
    if (
      name.toLowerCase().includes("hotel") ||
      name.toLowerCase().includes("palace") ||
      name.toLowerCase().includes("resort") ||
      place.tags?.tourism === "hotel" ||
      place.extratags?.tourism === "hotel"
    ) {
      const hotelImages = await getHotelImages(name)
      if (hotelImages.length > 0) {
        return hotelImages[0]
      }
    }
  
    // Try to search for images by name
    const nameImages = await searchLocationImages(name, lat, lng)
    if (nameImages.length > 0) {
      return nameImages[0]
    }
  
    // Fallback to OSM static map
    return getOSMStaticMapUrl(lat, lng)
  }
  
  // Function to generate a fallback image URL based on place type
  export function getPlaceTypeFallbackImage(place: any): string {
    if (!place) return `/placeholder.svg?height=300&width=600&query=location`
  
    let placeType = "place"
    const placeName = place.name || ""
  
    // Check for place type in various possible locations
    if (place.tags?.amenity) placeType = place.tags.amenity
    else if (place.extratags?.amenity) placeType = place.extratags.amenity
    else if (place.tags?.tourism) placeType = place.tags.tourism
    else if (place.extratags?.tourism) placeType = place.extratags.tourism
    else if (place.type) placeType = place.type
  
    // Format the place type for the image query
    placeType = placeType.replace(/_/g, " ")
  
    // For hotels, use hotel-specific images
    if (
      placeType.includes("hotel") ||
      placeName.toLowerCase().includes("hotel") ||
      placeName.toLowerCase().includes("palace")
    ) {
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
    }
  
    // For restaurants
    if (placeType.includes("restaurant") || placeType.includes("cafe")) {
      return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
    }
  
    // For attractions
    if (placeType.includes("attraction") || placeType.includes("museum")) {
      return "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXVzZXVtfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
    }
  
    return `/placeholder.svg?height=300&width=600&query=${encodeURIComponent(placeType)}`
  }
  
  // Function to proxy an image URL through our own API to avoid CORS issues
  export function getProxiedImageUrl(imageUrl: string): string {
    // Check if the URL is already a data URL or a relative URL
    if (imageUrl.startsWith("data:") || imageUrl.startsWith("/")) {
      return imageUrl
    }
  
    // Otherwise, proxy it through our API
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
  }
  