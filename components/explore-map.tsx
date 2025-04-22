"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Navigation, Loader2, AlertCircle, Plane, X, ArrowLeft } from "lucide-react"
import { CategorySearch } from "./category-search"
import { PlaceInfoPanel } from "./place-info-panel"
import { SearchResults } from "./search-results"
import { FilterControls } from "./filter-controls"
import { toast } from "@/hooks/use-toast"

// Fix for Leaflet icons in Next.js
if (typeof window !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

// Custom icons for different place types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            <div style="color: white; font-size: 12px; font-weight: bold;"></div>
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

// Icon for user location
const userLocationIcon = L.divIcon({
  className: "user-location-icon",
  html: `<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

// Custom icons for different place types
const placeIcons = {
  default: createCustomIcon("#6B7280"), // Gray
  restaurant: createCustomIcon("#EF4444"), // Red
  hotel: createCustomIcon("#8B5CF6"), // Purple
  attraction: createCustomIcon("#F59E0B"), // Amber
  hospital: createCustomIcon("#10B981"), // Green
  school: createCustomIcon("#3B82F6"), // Blue
  airport: createCustomIcon("#000000"), // Black
}

// Helper function to determine which icon to use
const getIconForPlace = (place: any) => {
  const type = place.type?.toLowerCase() || ""

  if (type.includes("restaurant") || type.includes("cafe") || type.includes("bar")) {
    return placeIcons.restaurant
  } else if (type.includes("hotel") || type.includes("lodging")) {
    return placeIcons.hotel
  } else if (type.includes("attraction") || type.includes("tourism") || type.includes("museum")) {
    return placeIcons.attraction
  } else if (type.includes("hospital") || type.includes("clinic") || type.includes("doctor")) {
    return placeIcons.hospital
  } else if (type.includes("school") || type.includes("university") || type.includes("college")) {
    return placeIcons.school
  } else if (type.includes("airport") || type.includes("aerodrome")) {
    return placeIcons.airport
  }

  return placeIcons.default
}

// Component to update map center when user location changes
function UpdateMapCenter({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])

  return null
}

// Main ExploreMap component
export function ExploreMap() {
  // State for location and map
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
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

  const mapRef = useRef<any>(null)

  // Function to get user location from IP
  const getLocationFromIP = useCallback(async () => {
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

        // Fetch nearby places based on IP location
        fetchNearbyPlaces(lat, lng)

        // Also fetch nearby airports
        if (showAirports) {
          fetchNearbyAirports(lat, lng)
        }
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
  }, [showAirports])

  // Function to request location from browser
  const requestBrowserLocation = useCallback(() => {
    setLoading((prev) => ({ ...prev, location: true }))

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setMapCenter([latitude, longitude])

          // Fetch nearby places based on browser location
          fetchNearbyPlaces(latitude, longitude)

          // Also fetch nearby airports
          if (showAirports) {
            fetchNearbyAirports(latitude, longitude)
          }

          setLoading((prev) => ({ ...prev, location: false }))
        },
        (error) => {
          console.error("Error getting browser location:", error)
          setError("Could not determine your location. Using default location.")
          setLoading((prev) => ({ ...prev, location: false }))

          // Use default location
          const defaultLat = 51.505
          const defaultLng = -0.09

          // Fetch nearby places based on default location
          fetchNearbyPlaces(defaultLat, defaultLng)

          // Also fetch nearby airports
          if (showAirports) {
            fetchNearbyAirports(defaultLat, defaultLng)
          }
        },
      )
    } else {
      setError("Geolocation is not supported by your browser. Using default location.")
      setLoading((prev) => ({ ...prev, location: false }))

      // Use default location
      const defaultLat = 51.505
      const defaultLng = -0.09

      // Fetch nearby places based on default location
      fetchNearbyPlaces(defaultLat, defaultLng)

      // Also fetch nearby airports
      if (showAirports) {
        fetchNearbyAirports(defaultLat, defaultLng)
      }
    }
  }, [showAirports])

  // Function to fetch nearby places
  const fetchNearbyPlaces = useCallback(async (lat: number, lng: number, category?: string) => {
    setLoading((prev) => ({ ...prev, places: true }))

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: "2000", // 2km radius
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
        setPlaces(data.data)
        setFilteredPlaces(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch nearby places")
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error)
      toast({
        title: "Error",
        description: "Failed to fetch nearby places. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, places: false }))
    }
  }, [])

  // Function to fetch place details
  const fetchPlaceDetails = useCallback(async (placeId: string) => {
    setLoading((prev) => ({ ...prev, placeDetails: true }))

    try {
      const response = await fetch(`/api/places/details?id=${placeId}`)
      if (!response.ok) {
        throw new Error(`Error fetching place details: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setPlaceDetails(data.data)
        setShowPlaceInfo(true)
      } else {
        throw new Error(data.error || "Failed to fetch place details")
      }
    } catch (error) {
      console.error("Error fetching place details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch place details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, placeDetails: false }))
    }
  }, [])

  // Function to fetch nearby airports
  const fetchNearbyAirports = useCallback(async (lat: number, lng: number) => {
    setLoading((prev) => ({ ...prev, airports: true }))

    try {
      const response = await fetch(`/api/airports/nearby?lat=${lat}&lng=${lng}`)
      if (!response.ok) {
        throw new Error(`Error fetching nearby airports: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setAirports(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch nearby airports")
      }
    } catch (error) {
      console.error("Error fetching nearby airports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch nearby airports. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, airports: false }))
    }
  }, [])

  // Function to fetch flight data for an airport
  const fetchFlightData = useCallback(async (airportCode: string) => {
    setLoading((prev) => ({ ...prev, flights: true }))

    try {
      const response = await fetch(`/api/airports/flights?code=${airportCode}`)
      if (!response.ok) {
        throw new Error(`Error fetching flight data: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setFlights(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch flight data")
      }
    } catch (error) {
      console.error("Error fetching flight data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch flight data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, flights: false }))
    }
  }, [])

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Show search results panel
    setShowSearchResults(true)

    // For now, we'll just fetch places near the current map center
    // In a real app, you might want to geocode the search query
    const [lat, lng] = mapCenter
    fetchNearbyPlaces(lat, lng, selectedCategory || undefined)
  }

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    const [lat, lng] = mapCenter
    fetchNearbyPlaces(lat, lng, category)

    // Show search results when a category is selected
    setShowSearchResults(true)
  }

  // Handle place selection
  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place)
    setSelectedAirport(null) // Clear any selected airport
    setFlights([]) // Clear flight data

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

  // Initialize: Get user location on component mount
  useEffect(() => {
    getLocationFromIP()
  }, [getLocationFromIP])

  // Apply filters when places or filters change
  useEffect(() => {
    applyFilters(places, activeFilters)
  }, [places, activeFilters])

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
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
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={showSearchResults ? "pl-10" : ""}
                />
                <Button type="submit" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
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
                    // In a real app, you would implement directions here
                    toast({
                      title: "Directions",
                      description: "Directions functionality would be implemented here.",
                    })
                  }}
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
                  />
                </>
              )}

              {/* Show default view with categories */}
              {!showSearchResults && !showPlaceInfo && (
                <div className="p-4">
                  {/* Category filter */}
                  <CategorySearch onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />

                  {/* Airport toggle */}
                  <div className="flex items-center space-x-2 my-4">
                    <Button
                      variant={showAirports ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowAirports(!showAirports)
                        if (!showAirports && userLocation) {
                          fetchNearbyAirports(userLocation[0], userLocation[1])
                        }
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Plane className="h-4 w-4" />
                      <span>{showAirports ? "Hide Airports" : "Show Airports"}</span>
                    </Button>
                  </div>

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
            {typeof window !== "undefined" && (
              <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} ref={mapRef}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* User location marker */}
                {userLocation && (
                  <>
                    <Marker position={userLocation} icon={userLocationIcon}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-medium">Your Location</p>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={userLocation}
                      radius={100}
                      pathOptions={{ color: "#3B82F6", fillColor: "#93C5FD", weight: 1 }}
                    />
                  </>
                )}

                {/* Place markers */}
                {places.map((place) => (
                  <Marker
                    key={place.id}
                    position={[place.lat, place.lng]}
                    icon={getIconForPlace(place)}
                    eventHandlers={{
                      click: () => handlePlaceSelect(place),
                    }}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-bold">{place.name}</h3>
                        <p className="text-xs">{place.type}</p>
                        {place.address && (
                          <p className="text-xs mt-1">{Object.values(place.address).filter(Boolean).join(", ")}</p>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() => handlePlaceSelect(place)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Airport markers */}
                {showAirports &&
                  airports.map((airport) => (
                    <Marker
                      key={airport.id}
                      position={[airport.lat, airport.lng]}
                      icon={placeIcons.airport}
                      eventHandlers={{
                        click: () => handleAirportSelect(airport),
                      }}
                    >
                      <Popup>
                        <div>
                          <h3 className="font-bold">{airport.name}</h3>
                          {airport.code && <p className="text-xs">{airport.code}</p>}
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => handleAirportSelect(airport)}
                          >
                            View Flight Info
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                <UpdateMapCenter center={mapCenter} />
              </MapContainer>
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
    </Card>
  )
}
