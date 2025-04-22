"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, Clock, MapPin, Navigation, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchResultsProps {
  places: any[]
  loading: boolean
  onPlaceSelect: (place: any) => void
  selectedPlace: any | null
  userLocation: [number, number] | null
  onGetDirections: (place: any) => void
  onSharePlace: (place: any) => void
}

export function SearchResults({
  places,
  loading,
  onPlaceSelect,
  selectedPlace,
  userLocation,
  onGetDirections,
  onSharePlace,
}: SearchResultsProps) {
  // Format rating stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  // Format place type
  const formatType = (place: any) => {
    if (place.tags?.amenity) return formatCategory(place.tags.amenity)
    if (place.tags?.tourism) return formatCategory(place.tags.tourism)
    if (place.tags?.shop) return formatCategory(place.tags.shop)
    if (place.tags?.leisure) return formatCategory(place.tags.leisure)
    if (place.type) return formatCategory(place.type)

    return "Place"
  }

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Format address
  const formatAddress = (place: any) => {
    const addressParts = []
    if (place.address?.road) addressParts.push(place.address.road)
    if (place.address?.suburb) addressParts.push(place.address.suburb)

    return addressParts.join(", ")
  }

  // Generate random rating if not available
  const getRating = (place: any) => {
    if (place?.tags?.rating) return Number.parseFloat(place.tags.rating)
    // Generate a random rating between 3.0 and 5.0
    return (Math.random() * 2 + 3).toFixed(1)
  }

  // Generate random number of reviews
  const getReviewCount = () => {
    return Math.floor(Math.random() * 200) + 5
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return Math.round(d * 10) / 10 // Round to 1 decimal place
  }

  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  if (loading) {
    return (
      <div className="space-y-4 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-3 p-2">
            <Skeleton className="h-20 w-20 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No places found. Try a different search or category.</p>
      </div>
    )
  }

  // Sort places by distance if user location is available
  const sortedPlaces = [...places]
  if (userLocation) {
    sortedPlaces.sort((a, b) => {
      const distanceA = calculateDistance(userLocation[0], userLocation[1], a.lat, a.lng) || Number.POSITIVE_INFINITY
      const distanceB = calculateDistance(userLocation[0], userLocation[1], b.lat, b.lng) || Number.POSITIVE_INFINITY
      return distanceA - distanceB
    })
  }

  return (
    <div className="divide-y">
      {sortedPlaces.map((place) => {
        const rating = getRating(place)
        const reviewCount = getReviewCount()
        const distance = userLocation ? calculateDistance(userLocation[0], userLocation[1], place.lat, place.lng) : null

        return (
          <div
            key={place.id}
            className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedPlace?.id === place.id ? "bg-blue-50" : ""}`}
            onClick={() => onPlaceSelect(place)}
          >
            <div className="flex space-x-3">
              {/* Place image */}
              <div className="h-20 w-20 bg-gray-200 rounded overflow-hidden shrink-0">
                <img
                  src={place.tags?.image || `/placeholder.svg?height=80&width=80&query=${formatType(place)}`}
                  alt={place.name || "Unnamed Place"}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Place details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm truncate">{place.name || "Unnamed Place"}</h3>
                  {distance !== null && (
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-700 whitespace-nowrap">
                      {distance} km
                    </span>
                  )}
                </div>

                <div className="flex items-center mt-1 space-x-1">
                  <span className="text-sm font-medium">{rating}</span>
                  {renderStars(Number.parseFloat(rating))}
                  <span className="text-xs text-gray-500">({reviewCount})</span>
                </div>

                <div className="mt-1 text-xs text-gray-600">{formatType(place)}</div>

                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{formatAddress(place)}</span>
                </div>

                {place.tags?.opening_hours && (
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{place.tags.opening_hours.includes("open") ? "Open" : "Closed"}</span>
                  </div>
                )}

                <div className="mt-2 flex space-x-2">
                  {userLocation && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation()
                        onGetDirections(place)
                      }}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSharePlace(place)
                    }}
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
