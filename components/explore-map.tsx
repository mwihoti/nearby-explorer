"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Navigation,
  Loader2,
  AlertCircle,
  Plane,
  X,
  ArrowLeft,
  MapPin,
  LocateFixed,
  Route,
  Clock,
  Bookmark,
  BookmarkCheck,
  Globe,
} from "lucide-react"
import { CategorySearch } from "./category-search"
import { PlaceInfoPanel } from "./place-info-panel"
import { SearchResults } from "./search-results"
import { FilterControls } from "./filter-controls"
import { toast } from "@/hooks/use-toast"
import { safeSetItem, safeGetItem, compressForStorage } from "@/lib/storage-utils"
import { SearchDialog } from "./explore-map-search-dialog"
import { SharePlaceDialog } from "./share-place-dialog"

// Generate a random user ID for demo purposes
// In a real app, this would come from authentication
const generateUserId = () => {
  if (typeof window !== "undefined") {
    let userId = localStorage.getItem("userId")
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substring(2, 15)
      localStorage.setItem("userId", userId)
    }
    return userId
  }
  return "user_" + Math.random().toString(36).substring(2, 15)
}

// Dynamically import the Map component with SSR disabled
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
})

// Main ExploreMap component
interface ExploreMapProps {
  sharedPlaceId?: string
}

export function ExploreMap({ sharedPlaceId }: ExploreMapProps) {
  // State for location and map
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [manualLocation, setManualLocation] = useState<[number, number] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]) // Default to London
  const [searchQuery, setSearchQuery] = useState("")
  const [places, setPlaces] = useState<any[]>([])
  const [filteredPlaces, setFilteredPlaces] = useState<any[]>([])
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null)
  const [placeDetails, setPlaceDetails] = useState<any | null>(null)
  const [airports, setAirports] = useState<any[]>([])
  const [selectedAirport, setSelectedAirport] = useState<any | null>(null)
  const [flights, setFlights] = useState<any[]>([])
  const [loading, setLoading] = useState({
    location: false,
    places: false,
    placeDetails: false,
    airports: false,
    flights: false,
    directions: false,
    search: false,
    saving: false,
    sharing: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAirports, setShowAirports] = useState(true)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showPlaceInfo, setShowPlaceInfo] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    rating: "all",
    hours: "all",
  })
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [isPickingLocation, setIsPickingLocation] = useState(false)
  const [routeInfo, setRouteInfo] = useState<{
    distance: number
    duration: number
    route: [number, number][]
  } | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [placeToShare, setPlaceToShare] = useState<any | null>(null)
  const [savedPlaces, setSavedPlaces] = useState<any[]>([])
  const [showSavedPlaces, setShowSavedPlaces] = useState(false)
  const [userId] = useState(generateUserId)
  const polylineRef = useRef<any>(null)
  const mapRef = useRef<any>(null)

  // Get the effective location (manual location if set, otherwise user location)
  const effectiveLocation = manualLocation || userLocation

  // Function to get user location from IP - now on-demand instead of on page load
  const getLocationFromIP = useCallback(async () => {
    // Check if we already have location data in localStorage
    const cachedLocation = safeGetItem("userLocation")
    if (cachedLocation) {
      try {
        const { lat, lng, timestamp } = cachedLocation
        // Check if the cached location is less than 1 hour old
        if (timestamp && Date.now() - timestamp < 3600000) {
          setUserLocation([lat, lng])
          setMapCenter([lat, lng])
          return
        }
      } catch (e) {
        console.error("Error parsing cached location:", e)
      }
    }

    setLoading((prev) => ({ ...prev, location: true }))

    try {
      const response = await fetch("/api/geolocation")
      if (!response.ok) {
        throw new Error("Failed to fetch IP-based location")
      }

      const data = await response.json()

      if (data.success && data.data) {
        const { lat, lng } = data.data
        setUserLocation([lat, lng])
        setMapCenter([lat, lng])

        // Cache the location data with timestamp
        safeSetItem("userLocation", {
          lat,
          lng,
          timestamp: Date.now(),
        })
      } else {
        throw new Error(data.error || "Failed to get location from IP")
      }
    } catch (error) {
      console.error("Error getting location from IP:", error)
      // Fall back to browser geolocation
      requestBrowserLocation()
    } finally {
      setLoading((prev) => ({ ...prev, location: false }))
    }
  }, [])

  // Function to request location from browser
  const requestBrowserLocation = useCallback(() => {
    setLoading((prev) => ({ ...prev, location: true }))

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setMapCenter([latitude, longitude])

          // Cache the location data with timestamp
          safeSetItem("userLocation", {
            lat: latitude,
            lng: longitude,
            timestamp: Date.now(),
          })

          setLoading((prev) => ({ ...prev, location: false }))
        },
        (error) => {
          console.error("Error getting browser location:", error)
          setError("Could not determine your location. You can set your location manually.")
          setLoading((prev) => ({ ...prev, location: false }))
        },
      )
    } else {
      setError("Geolocation is not supported by your browser. You can set your location manually.")
      setLoading((prev) => ({ ...prev, location: false }))
    }
  }, [])

  // Function to handle manual location setting
  const handleManualLocationSet = useCallback(
    (location: [number, number]) => {
      setManualLocation(location)
      setMapCenter(location)
      setIsPickingLocation(false)

      // Cache the manual location
      safeSetItem("manualLocation", {
        lat: location[0],
        lng: location[1],
        timestamp: Date.now(),
      })

      // Fetch nearby places for the new location
      fetchNearbyPlaces(location[0], location[1], selectedCategory || undefined)

      // Also fetch nearby airports if enabled
      if (showAirports) {
        fetchNearbyAirports(location[0], location[1])
      }

      toast.success({
        title: "Location set",
        description: "Your manual location has been set successfully.",
      })
    },
    [selectedCategory, showAirports],
  )

  // Function to clear manual location
  const clearManualLocation = useCallback(() => {
    setManualLocation(null)
    localStorage.removeItem("manualLocation")

    if (userLocation) {
      setMapCenter(userLocation)

      // Refresh data for user location
      fetchNearbyPlaces(userLocation[0], userLocation[1], selectedCategory || undefined)
      if (showAirports) {
        fetchNearbyAirports(userLocation[0], userLocation[1])
      }
    }

    toast.default({
      title: "Manual location cleared",
      description: "Using your device location now.",
    })
  }, [userLocation, selectedCategory, showAirports])

  // Function to fetch nearby places - optimized with caching
  const fetchNearbyPlaces = useCallback(async (lat: number, lng: number, category?: string) => {
    setLoading((prev) => ({ ...prev, places: true }))

    try {
      // Check cache first
      const cacheKey = `places_${lat.toFixed(4)}_${lng.toFixed(4)}_${category || "all"}`
      const cachedData = safeGetItem(cacheKey)

      if (cachedData) {
        try {
          const { data, timestamp } = cachedData
          // Use cached data if it's less than 1 hour old
          if (timestamp && Date.now() - timestamp < 3600000) {
            setPlaces(data)
            setFilteredPlaces(data)
            setLoading((prev) => ({ ...prev, places: false }))
            return
          }
        } catch (e) {
          console.error("Error parsing cached places:", e)
        }
      }

      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: "10000", // 10km radius
      })

      if (category) {
        params.append("category", category)
      }

      const response = await fetch(`/api/places/nearby?${params}`)
      if (!response.ok) {
        throw new Error(`Error fetching nearby places: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Compress data before caching to avoid quota issues
        const compressedData = compressForStorage(data.data)

        // Cache the data with timestamp
        safeSetItem(cacheKey, {
          data: compressedData,
          timestamp: Date.now(),
        })

        setPlaces(data.data)
        setFilteredPlaces(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch nearby places")
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error)
      toast.error({
        title: "Error",
        description: "Failed to fetch nearby places. Please try again.",
      })
    } finally {
      setLoading((prev) => ({ ...prev, places: false }))
    }
  }, [])

  // Function to fetch place details - optimized with caching
  const fetchPlaceDetails = useCallback(async (placeId: string) => {
    setLoading((prev) => ({ ...prev, placeDetails: true }))

    try {
      // Check cache first
      const cacheKey = `place_${placeId}`
      const cachedData = safeGetItem(cacheKey)

      if (cachedData) {
        try {
          const { data, timestamp } = cachedData
          // Use cached data if it's less than 1 day old
          if (timestamp && Date.now() - timestamp < 86400000) {
            setPlaceDetails(data)
            setShowPlaceInfo(true)
            setLoading((prev) => ({ ...prev, placeDetails: false }))
            return
          }
        } catch (e) {
          console.error("Error parsing cached place details:", e)
        }
      }

      const response = await fetch(`/api/places/details?id=${placeId}`)
      if (!response.ok) {
        throw new Error(`Error fetching place details: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Cache the data with timestamp
        safeSetItem(cacheKey, {
          data: data.data,
          timestamp: Date.now(),
        })

        setPlaceDetails(data.data)
        setShowPlaceInfo(true)
      } else {
        throw new Error(data.error || "Failed to fetch place details")
      }
    } catch (error) {
      console.error("Error fetching place details:", error)
      toast.error({
        title: "Error",
        description: "Failed to fetch place details. Please try again.",
      })
    } finally {
      setLoading((prev) => ({ ...prev, placeDetails: false }))
    }
  }, [])

  // Function to fetch shared place
  const fetchSharedPlace = useCallback(async (shareId: string) => {
    setLoading((prev) => ({ ...prev, placeDetails: true }))

    try {
      const response = await fetch(`/api/places/share?id=${shareId}`)
      if (!response.ok) {
        throw new Error(`Error fetching shared place: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        const sharedPlace = data.data

        // Set the place as selected
        setSelectedPlace({
          id: sharedPlace.placeId,
          name: sharedPlace.name,
          lat: sharedPlace.lat,
          lng: sharedPlace.lng,
          type: sharedPlace.type,
          address: sharedPlace.address,
          tags: sharedPlace.tags,
        })

        // Center map on the shared place
        setMapCenter([sharedPlace.lat, sharedPlace.lng])

        // Show place details
        setPlaceDetails({
          place_id: sharedPlace.placeId,
          name: sharedPlace.name,
          lat: sharedPlace.lat,
          lon: sharedPlace.lng,
          type: sharedPlace.type,
          address: sharedPlace.address,
          extratags: sharedPlace.tags,
        })

        setShowPlaceInfo(true)

        toast.success({
          title: "Shared place loaded",
          description: `Viewing ${sharedPlace.name || "shared location"}`,
        })
      } else {
        throw new Error(data.error || "Failed to fetch shared place")
      }
    } catch (error) {
      console.error("Error fetching shared place:", error)
      toast.error({
        title: "Error",
        description: "Failed to load the shared place. It may have been removed or the link is invalid.",
      })
    } finally {
      setLoading((prev) => ({ ...prev, placeDetails: false }))
    }
  }, [])

  // Function to handle sharing a place
  const handleSharePlace = useCallback((place: any) => {
    setPlaceToShare(place)
    setShowShareDialog(true)
  }, [])

  // Function to fetch nearby airports - optimized with caching
  const fetchNearbyAirports = useCallback(async (lat: number, lng: number) => {
    setLoading((prev) => ({ ...prev, airports: true }))

    try {
      // Check cache first
      const cacheKey = `airports_${lat.toFixed(4)}_${lng.toFixed(4)}`
      const cachedData = safeGetItem(cacheKey)

      if (cachedData) {
        try {
          const { data, timestamp } = cachedData
          // Use cached data if it's less than 1 day old (airports don't change often)
          if (timestamp && Date.now() - timestamp < 86400000) {
            setAirports(data)
            setLoading((prev) => ({ ...prev, airports: false }))
            return
          }
        } catch (e) {
          console.error("Error parsing cached airports:", e)
        }
      }

      const response = await fetch(`/api/airports/nearby?lat=${lat}&lng=${lng}`)
      if (!response.ok) {
        throw new Error(`Error fetching nearby airports: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Compress data before caching to avoid quota issues
        const compressedData = compressForStorage(data.data)

        // Cache the data with timestamp
        safeSetItem(cacheKey, {
          data: compressedData,
          timestamp: Date.now(),
        })

        setAirports(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch nearby airports")
      }
    } catch (error) {
      console.error("Error fetching nearby airports:", error)
      toast.error({
        title: "Error",
        description: "Failed to fetch nearby airports. Please try again.",
      })
    } finally {
      setLoading((prev) => ({ ...prev, airports: false }))
    }
  }, [])

  // Function to fetch flight data for an airport - optimized with caching
  const fetchFlightData = useCallback(async (airportCode: string) => {
    setLoading((prev) => ({ ...prev, flights: true }))

    try {
      // Check cache first
      const cacheKey = `flights_${airportCode}`
      const cachedData = safeGetItem(cacheKey)

      if (cachedData) {
        try {
          const { data, timestamp } = cachedData
          // Use cached data if it's less than 1 hour old
          if (timestamp && Date.now() - timestamp < 3600000) {
            setFlights(data)
            setLoading((prev) => ({ ...prev, flights: false }))
            return
          }
        } catch (e) {
          console.error("Error parsing cached flights:", e)
        }
      }

      const response = await fetch(`/api/airports/flights?code=${airportCode}`)
      if (!response.ok) {
        throw new Error(`Error fetching flight data: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Compress data before caching to avoid quota issues
        const compressedData = compressForStorage(data.data)

        // Cache the data with timestamp
        safeSetItem(cacheKey, {
          data: compressedData,
          timestamp: Date.now(),
        })

        setFlights(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch flight data")
      }
    } catch (error) {
      console.error("Error fetching flight data:", error)
      toast.error({
        title: "Error",
        description: "Failed to fetch flight data. Please try again.",
      })
    } finally {
      setLoading((prev) => ({ ...prev, flights: false }))
    }
  }, [])

  // Function to get directions using OSRM
  const getDirections = useCallback(async (from: [number, number], to: [number, number]) => {
    setLoading((prev) => ({ ...prev, directions: true }))
    setRouteInfo(null)

    try {
      // Use our API endpoint for directions
      const response = await fetch(
        `/api/directions?fromLat=${from[0]}&fromLng=${from[1]}&toLat=${to[0]}&toLng=${to[1]}`,
      )

      if (!response.ok) {
        throw new Error(`Error fetching directions: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setRouteInfo(data.data)

        toast.default({
          title: "Directions found",
          description: `Distance: ${data.data.distance} km, Duration: ${data.data.duration} min`,
        })
      } else {
        throw new Error(data.error || "No route found")
      }
    } catch (error) {
      console.error("Error getting directions:", error)
      toast.error({
        title: "Error",
        description: "Failed to get directions. Please try again.",
      })
    } finally {
      setLoading((prev) => ({ ...prev, directions: false }))
    }
  }, [])

  // Function to search for locations globally
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) return

    setLoading((prev) => ({ ...prev, search: true }))
    setSearchResults([])

    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error(`Error searching locations: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        if (data.data.length > 0) {
          setSearchResults(data.data)

          // If there's only one result, automatically select it
          if (data.data.length === 1) {
            handleLocationSelect(data.data[0])
          } else {
            // Otherwise show the dialog
            setShowSearchDialog(true)
          }
        } else {
          toast.warning({
            title: "No results found",
            description: `No locations found for "${query}". Try a different search term.`,
          })
        }
      } else {
        throw new Error(data.error || "No locations found")
      }
    } catch (error) {
      console.error("Error searching locations:", error)
      toast.error({
        title: "Error",
        description: "Failed to search locations. Please try again.",
      })
    } finally {
      setLoading((prev) => ({ ...prev, search: false }))
    }
  }, [])

  // Function to handle location selection from search results
  const handleLocationSelect = useCallback(
    (location: any) => {
      setShowSearchDialog(false)

      // Set as manual location and update map center
      handleManualLocationSet([location.lat, location.lng])

      // Clear search results and query
      setSearchResults([])
      setSearchQuery("")

      // Show a toast notification
      toast.success({
        title: "Location found",
        description: `Showing results for ${location.name}`,
      })
    },
    [handleManualLocationSet],
  )

  // Function to save a place to MongoDB
  const savePlace = useCallback(
    async (place: any) => {
      if (!place || !place.id) {
        toast.error({
          title: "Error",
          description: "Invalid place data",
        })
        return
      }

      setLoading((prev) => ({ ...prev, saving: true }))

      try {
        const response = await fetch("/api/places/saved", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            place,
          }),
        })

        const data = await response.json()

        if (data.success) {
          toast.default({
            title: "Success",
            description: "Place saved successfully",
          })

          // Refresh saved places
          fetchSavedPlaces()
        } else if (response.status === 409) {
          toast.default({
            title: "Already saved",
            description: "This place is already in your saved places",
          })
        } else {
          throw new Error(data.error || "Failed to save place")
        }
      } catch (error) {
        console.error("Error saving place:", error)
        toast.error({
          title: "Error",
          description: "Failed to save place. Please try again.",
        })
      } finally {
        setLoading((prev) => ({ ...prev, saving: false }))
      }
    },
    [userId],
  )

  // Function to remove a saved place
  const removeSavedPlace = useCallback(
    async (placeId: string) => {
      setLoading((prev) => ({ ...prev, saving: true }))

      try {
        const response = await fetch(`/api/places/saved?userId=${userId}&placeId=${placeId}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (data.success) {
          toast.default({
            title: "Success",
            description: "Place removed from saved places",
          })

          // Refresh saved places
          fetchSavedPlaces()
        } else {
          throw new Error(data.error || "Failed to remove saved place")
        }
      } catch (error) {
        console.error("Error removing saved place:", error)
        toast.error({
          title: "Error",
          description: "Failed to remove saved place. Please try again.",
        })
      } finally {
        setLoading((prev) => ({ ...prev, saving: false }))
      }
    },
    [userId],
  )

  // Function to fetch saved places
  const fetchSavedPlaces = useCallback(async () => {
    try {
      const response = await fetch(`/api/places/saved?userId=${userId}`)

      if (!response.ok) {
        throw new Error(`Error fetching saved places: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setSavedPlaces(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch saved places")
      }
    } catch (error) {
      console.error("Error fetching saved places:", error)
      toast.error({
        title: "Error",
        description: "Failed to fetch saved places. Please try again.",
      })
    }
  }, [userId])

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Check if it's a global search or a local search
    if (searchQuery.includes(",") || searchQuery.length > 10) {
      // Likely a location search (e.g., "Nakuru, Kenya")
      searchLocations(searchQuery)
    } else {
      // Local search - show search results panel
      setShowSearchResults(true)

      // For now, we'll just fetch places near the current map center
      const [lat, lng] = mapCenter
      fetchNearbyPlaces(lat, lng, selectedCategory || undefined)
    }
  }

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)

    if (effectiveLocation) {
      fetchNearbyPlaces(effectiveLocation[0], effectiveLocation[1], category)
    } else {
      const [lat, lng] = mapCenter
      fetchNearbyPlaces(lat, lng, category)
    }

    // Show search results when a category is selected
    setShowSearchResults(true)
  }

  // Handle place selection
  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place)
    setSelectedAirport(null) // Clear any selected airport
    setFlights([]) // Clear flight data
    setRouteInfo(null) // Clear route info

    if (place.id) {
      fetchPlaceDetails(place.id)
    }

    // Center map on selected place
    if (place.lat && place.lng) {
      setMapCenter([place.lat, place.lng])
    }
  }

  // Handle airport selection
  const handleAirportSelect = (airport: any) => {
    setSelectedAirport(airport)
    setSelectedPlace(null) // Clear any selected place
    setPlaceDetails(null) // Clear place details
    setShowPlaceInfo(false)
    setRouteInfo(null) // Clear route info

    if (airport.code) {
      fetchFlightData(airport.code)
    }

    // Center map on selected airport
    if (airport.lat && airport.lng) {
      setMapCenter([airport.lat, airport.lng])
    }
  }

  // Center map on user location
  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation)
    } else {
      // Try to get location again
      requestBrowserLocation()
    }
  }

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))

    // Apply filters to places
    applyFilters(places, { ...activeFilters, [filterType]: value })
  }

  // Apply filters to places
  const applyFilters = (placesToFilter: any[], filters: typeof activeFilters) => {
    let result = [...placesToFilter]

    // Apply rating filter
    if (filters.rating !== "all") {
      const minRating = Number.parseFloat(filters.rating.replace("+", ""))
      result = result.filter((place) => {
        const rating = place.tags?.rating ? Number.parseFloat(place.tags.rating) : Math.random() * 2 + 3
        return rating >= minRating
      })
    }

    // Apply hours filter
    if (filters.hours !== "all") {
      if (filters.hours === "open_now") {
        result = result.filter((place) => place.tags?.opening_hours && place.tags.opening_hours.includes("open"))
      } else if (filters.hours === "24_hours") {
        result = result.filter((place) => place.tags?.opening_hours && place.tags.opening_hours.includes("24/7"))
      }
    }

    setFilteredPlaces(result)
  }

  // Initialize map when component mounts
  useEffect(() => {
    setIsMapInitialized(true)

    // Check for cached manual location
    const cachedManualLocation = safeGetItem("manualLocation")
    if (cachedManualLocation) {
      try {
        const { lat, lng, timestamp } = cachedManualLocation
        // Use cached manual location if it's less than 1 day old
        if (timestamp && Date.now() - timestamp < 86400000) {
          setManualLocation([lat, lng])
          setMapCenter([lat, lng])
        }
      } catch (e) {
        console.error("Error parsing cached manual location:", e)
      }
    }

    // Fetch saved places
    fetchSavedPlaces()

    // If a shared place ID is provided, fetch and display it
    if (sharedPlaceId) {
      fetchSharedPlace(sharedPlaceId)
    }
  }, [fetchSavedPlaces, fetchSharedPlace, sharedPlaceId])

  // Apply filters when places or filters change
  useEffect(() => {
    applyFilters(places, activeFilters)
  }, [places, activeFilters])

  return (
    <Card className="w-full mt-16 max-w-5xl mx-auto flex justify-center items-center overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[700px]">
          {/* Left panel (1/3 on medium+ screens) */}
          <div className="p-0 border-r overflow-hidden flex flex-col">
            {/* Search bar */}
            <div className="p-2 border-b">
              <form onSubmit={handleSearch} className="relative">
                {showSearchResults && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10"
                    onClick={() => {
                      setShowSearchResults(false)
                      setShowPlaceInfo(false)
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Input
                  placeholder="Search places or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={showSearchResults ? "pl-10" : ""}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  disabled={loading.search}
                >
                  {loading.search ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </form>
              <div className="text-xs text-gray-500 mt-1">
                Tip: Search for specific places or locations like "Nakuru, Kenya"
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
              {/* Show place info panel */}
              {showPlaceInfo && placeDetails && (
                <PlaceInfoPanel
                  place={placeDetails}
                  onClose={() => {
                    setShowPlaceInfo(false)
                    setSelectedPlace(null)
                    setPlaceDetails(null)
                  }}
                  onGetDirections={() => {
                    if (effectiveLocation && selectedPlace) {
                      getDirections(effectiveLocation, [selectedPlace.lat, selectedPlace.lng])
                    } else {
                      toast.error({
                        title: "Error",
                        description: "Your location is needed to get directions.",
                      })
                    }
                  }}
                  onSavePlace={() => {
                    if (selectedPlace) {
                      savePlace(selectedPlace)
                    }
                  }}
                  onSharePlace={() => {
                    if (selectedPlace) {
                      handleSharePlace(selectedPlace)
                    }
                  }}
                  isSaving={loading.saving}
                  userLocation={effectiveLocation}
                  routeInfo={routeInfo}
                />
              )}

              {/* Show search results */}
              {showSearchResults && !showPlaceInfo && (
                <>
                  <div className="sticky top-0 bg-white z-10">
                    <div className="p-2 border-b">
                      <h2 className="font-medium">Results</h2>
                    </div>

                    {/* Filters */}
                    <FilterControls onFilterChange={handleFilterChange} activeFilters={activeFilters} />
                  </div>

                  <SearchResults
                    places={filteredPlaces}
                    loading={loading.places}
                    onPlaceSelect={handlePlaceSelect}
                    selectedPlace={selectedPlace}
                    userLocation={effectiveLocation}
                    onGetDirections={(place) => {
                      if (effectiveLocation && place) {
                        getDirections(effectiveLocation, [place.lat, place.lng])
                      }
                    }}
                    onSharePlace={handleSharePlace}
                  />
                </>
              )}

              {/* Show saved places */}
              {showSavedPlaces && !showPlaceInfo && !showSearchResults && (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-medium">Saved Places</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowSavedPlaces(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {savedPlaces.length === 0 ? (
                    <div className="text-center py-8">
                      <Bookmark className="h-12 w-12 mx-auto text-gray-300" />
                      <p className="mt-2 text-gray-500">No saved places yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedPlaces.map((place) => (
                        <div key={place._id} className="border rounded-lg p-3">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{place.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSavedPlace(place.placeId)}
                              disabled={loading.saving}
                            >
                              {loading.saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{place.type}</p>
                          <div className="flex space-x-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                const placeObj = {
                                  id: place.placeId,
                                  name: place.name,
                                  lat: place.lat,
                                  lng: place.lng,
                                  type: place.type,
                                  tags: place.tags,
                                  address: place.address,
                                }
                                handlePlaceSelect(placeObj)
                              }}
                            >
                              View
                            </Button>
                            {effectiveLocation && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  getDirections(effectiveLocation, [place.lat, place.lng])
                                }}
                              >
                                Directions
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                const placeObj = {
                                  id: place.placeId,
                                  name: place.name,
                                  lat: place.lat,
                                  lng: place.lng,
                                  type: place.type,
                                  tags: place.tags,
                                  address: place.address,
                                }
                                handleSharePlace(placeObj)
                              }}
                            >
                              Share
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Show default view with categories */}
              {!showSearchResults && !showPlaceInfo && !showSavedPlaces && (
                <div className="p-4">
                  {/* Location controls */}
                  <div className="mb-4 space-y-2">
                    <h3 className="text-sm font-medium">Your Location</h3>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={getLocationFromIP}
                        disabled={loading.location}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        {loading.location ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <LocateFixed className="h-4 w-4 mr-2" />
                        )}
                        Get my location
                      </Button>

                      <Button
                        onClick={() => setIsPickingLocation(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Set location manually
                      </Button>

                      <Button
                        onClick={() => setShowSearchDialog(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Search location
                      </Button>

                      {manualLocation && (
                        <Button onClick={clearManualLocation} variant="outline" size="sm" className="flex items-center">
                          <X className="h-4 w-4 mr-2" />
                          Clear manual location
                        </Button>
                      )}
                    </div>

                    {effectiveLocation && (
                      <div className="text-xs text-gray-500 mt-1">
                        {manualLocation ? "Using manually set location" : "Using device location"}
                      </div>
                    )}
                  </div>

                  {/* Saved places button */}
                  <div className="mb-4">
                    <Button
                      onClick={() => setShowSavedPlaces(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      View saved places
                    </Button>
                  </div>

                  {/* Category filter */}
                  <CategorySearch onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />

                  {/* Airport toggle */}
                  <div className="flex items-center space-x-2 my-4">
                    <Button
                      variant={showAirports ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowAirports(!showAirports)
                        if (!showAirports && effectiveLocation) {
                          fetchNearbyAirports(effectiveLocation[0], effectiveLocation[1])
                        }
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Plane className="h-4 w-4" />
                      <span>{showAirports ? "Hide Airports" : "Show Airports"}</span>
                    </Button>
                  </div>

                  {/* Route information */}
                  {routeInfo && (
                    <div className="mt-4 border rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">Route Information</h3>
                        <Button variant="ghost" size="sm" onClick={() => setRouteInfo(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Route className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">Distance:</span>
                          <span className="ml-2">{routeInfo.distance} km</span>
                        </div>

                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">Duration:</span>
                          <span className="ml-2">{routeInfo.duration} minutes</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected airport info */}
                  {!loading.flights && selectedAirport && (
                    <div className="mt-4 border rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">{selectedAirport.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAirport(null)
                            setFlights([])
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {selectedAirport.code && (
                        <div className="bg-gray-100 p-2 rounded mb-2">
                          <p className="text-sm font-medium">IATA Code: {selectedAirport.code}</p>
                        </div>
                      )}

                      <h4 className="font-medium mt-4 mb-2">Departures</h4>

                      {loading.flights ? (
                        <div className="flex justify-center my-4">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                      ) : flights.length > 0 ? (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {flights.map((flight) => (
                            <div key={flight.id} className="border rounded p-2 bg-white">
                              <div className="flex justify-between items-center">
                                <p className="font-bold">{flight.flightNumber}</p>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    flight.status === "On Time"
                                      ? "bg-green-100 text-green-800"
                                      : flight.status === "Delayed"
                                        ? "bg-red-100 text-red-800"
                                        : flight.status === "Boarding"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {flight.status}
                                </span>
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">To:</span> {flight.destinationCity} ({flight.destination})
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Departure:</span>{" "}
                                {new Date(flight.departureTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <p className="text-xs text-gray-500">{flight.airline}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No flight information available.</p>
                      )}
                    </div>
                  )}

                  {/* Loading state */}
                  {loading.location && (
                    <div className="flex justify-center items-center space-x-2 mt-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      <p className="text-sm text-gray-500">Determining your location...</p>
                    </div>
                  )}

                  {/* Error state */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Map (2/3 on medium+ screens) */}
          <div className="col-span-2 relative">
            {isMapInitialized && (
              <MapComponent
                mapCenter={mapCenter}
                userLocation={userLocation}
                manualLocation={manualLocation}
                places={places}
                airports={airports}
                selectedPlace={selectedPlace}
                showAirports={showAirports}
                isPickingLocation={isPickingLocation}
                routeCoordinates={routeInfo?.route || null}
                onPlaceSelect={handlePlaceSelect}
                onAirportSelect={handleAirportSelect}
                onCenterChange={setMapCenter}
                onManualLocationSet={handleManualLocationSet}
                onGetDirections={(from, to) => getDirections(from, to)}
                onSharePlace={handleSharePlace}
              />
            )}

            {/* Map controls */}
            <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-2">
              <Button
                size="icon"
                onClick={centerOnUser}
                variant="secondary"
                className="bg-white shadow-md"
                disabled={!userLocation || loading.location}
              >
                {loading.location ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Global location search dialog */}
      <SearchDialog
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        loading={loading.search}
        onSearch={searchLocations}
        onLocationSelect={handleLocationSelect}
      />

      {/* Share place dialog */}
      <SharePlaceDialog open={showShareDialog} onOpenChange={setShowShareDialog} place={placeToShare} userId={userId} />
    </Card>
  )
}
