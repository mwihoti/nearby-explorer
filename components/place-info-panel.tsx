"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Clock,
  Phone,
  Globe,
  ChevronLeft,
  Star,
  Navigation,
  Bookmark,
  Share2,
  Building,
  Route,
  Loader2,
  ImageIcon,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import {
  getOSMStaticMapUrl,
  getPlaceTypeFallbackImage,
  getProxiedImageUrl,
  searchLocationImages,
  getHotelImages,
} from "@/lib/image-utils"

interface PlaceInfoPanelProps {
  place: any
  onClose: () => void
  onGetDirections: () => void
  onSavePlace: () => void
  onSharePlace: () => void
  isSaving: boolean
  userLocation: [number, number] | null
  routeInfo: {
    distance: number
    duration: number
    route: any[]
  } | null
}

export function PlaceInfoPanel({
  place,
  onClose,
  onGetDirections,
  onSavePlace,
  onSharePlace,
  isSaving,
  userLocation,
  routeInfo,
}: PlaceInfoPanelProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [placeImages, setPlaceImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoadingImage, setIsLoadingImage] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Load the best available images for this place
  useEffect(() => {
    if (place) {
      setIsLoadingImage(true)
      setImageError(false)
      setPlaceImages([])
      setCurrentImageIndex(0)

      const loadImages = async () => {
        try {
          // First, try to get an image from place tags
          const tagImage = place.tags?.image || place.extratags?.image
          const images: string[] = []

          // Check if it's a hotel
          const isHotel =
            (place.name && place.name.toLowerCase().includes("hotel")) ||
            (place.name && place.name.toLowerCase().includes("palace")) ||
            place.tags?.tourism === "hotel" ||
            place.extratags?.tourism === "hotel"

          if (isHotel) {
            // Get hotel-specific images
            const hotelImages = await getHotelImages(place.name || "")
            if (hotelImages.length > 0) {
              images.push(...hotelImages)
            }
          }

          // Try to search for images by name
          if (place.name) {
            const nameImages = await searchLocationImages(place.name, place.lat, place.lon || place.lng)
            if (nameImages.length > 0) {
              // Add unique images only
              nameImages.forEach((img) => {
                if (!images.includes(img)) {
                  images.push(img)
                }
              })
            }
          }

          // Add tag image if it exists and isn't already included
          if (tagImage && !images.includes(tagImage)) {
            images.unshift(tagImage) // Add to the beginning
          }

          // Add OSM map as the last option
          const mapImage = getOSMStaticMapUrl(place.lat, place.lon || place.lng)
          if (!images.includes(mapImage)) {
            images.push(mapImage)
          }

          // If we still have no images, use a fallback
          if (images.length === 0) {
            images.push(getPlaceTypeFallbackImage(place))
          }

          // Update state with all found images
          setPlaceImages(images.map((img) => getProxiedImageUrl(img)))
          setIsLoadingImage(false)
        } catch (error) {
          console.error("Error loading place images:", error)
          setImageError(true)
          setIsLoadingImage(false)
          // Set fallback image
          setPlaceImages([getPlaceTypeFallbackImage(place)])
        }
      }

      loadImages()
    }
  }, [place])

  // Format address components
  const formatAddress = () => {
    if (!place) return ""

    // If we have a formatted address, use it
    if (place.formatted) return place.formatted

    const addressParts = []
    if (place.address?.road) addressParts.push(place.address.road)
    if (place.address?.house_number) addressParts.push(place.address.house_number)
    if (place.address?.suburb) addressParts.push(place.address.suburb)
    if (place.address?.city || place.address?.town) addressParts.push(place.address?.city || place.address?.town)

    // If we still don't have an address, try to use the display_name
    if (addressParts.length === 0 && place.display_name) {
      return place.display_name
    }

    return addressParts.join(", ") || "Address not available"
  }

  // Format place type
  const formatType = () => {
    if (!place) return "Place"

    // Check extratags first (Nominatim format)
    if (place.extratags?.amenity) return formatCategory(place.extratags.amenity)
    if (place.extratags?.tourism) return formatCategory(place.extratags.tourism)
    if (place.extratags?.shop) return formatCategory(place.extratags.shop)
    if (place.extratags?.leisure) return formatCategory(place.extratags.leisure)

    // Then check tags (our API format)
    if (place.tags?.amenity) return formatCategory(place.tags.amenity)
    if (place.tags?.tourism) return formatCategory(place.tags.tourism)
    if (place.tags?.shop) return formatCategory(place.tags.shop)
    if (place.tags?.leisure) return formatCategory(place.tags.leisure)

    // Finally check type
    if (place.type) return formatCategory(place.type)

    return "Place"
  }

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Format opening hours
  const formatOpeningHours = () => {
    // Check both possible locations for opening hours
    const hours = place?.extratags?.opening_hours || place?.tags?.opening_hours

    if (!hours) return "Hours not available"

    // Simple formatting for demo
    return hours.split(";").map((day: string, i: number) => (
      <div key={i} className="text-sm">
        {day.trim()}
      </div>
    ))
  }

  // Format phone number
  const formatPhone = () => {
    return place?.extratags?.phone || place?.tags?.phone || "Phone not available"
  }

  // Generate random rating if not available
  const getRating = () => {
    if (place?.tags?.rating) return Number.parseFloat(place.tags.rating)
    // Generate a random rating between 3.0 and 5.0
    return (Math.random() * 2 + 3).toFixed(1)
  }

  // Generate random number of reviews
  const getReviewCount = () => {
    return Math.floor(Math.random() * 200) + 5
  }

  // Calculate distance from user location
  const getDistance = () => {
    if (!userLocation || !place || !place.lat || !place.lon) return null

    // Calculate distance using Haversine formula
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(userLocation[0] - place.lat)
    const dLon = deg2rad(userLocation[1] - place.lon)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(place.lat)) * Math.cos(deg2rad(userLocation[0])) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return Math.round(d * 10) / 10 // Round to 1 decimal place
  }

  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // Navigate to the next image
  const nextImage = () => {
    if (placeImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % placeImages.length)
    }
  }

  // Navigate to the previous image
  const prevImage = () => {
    if (placeImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? placeImages.length - 1 : prevIndex - 1))
    }
  }

  // Toggle between map and image view
  const toggleMapView = () => {
    setShowMap(!showMap)

    if (!showMap) {
      // Find the index of the map image (usually the last one)
      const mapIndex = placeImages.findIndex((url) => url.includes("staticmap.openstreetmap.de"))
      if (mapIndex !== -1) {
        setCurrentImageIndex(mapIndex)
      }
    } else {
      // Go back to the first image
      setCurrentImageIndex(0)
    }
  }

  const rating = getRating()
  const reviewCount = getReviewCount()
  const distance = getDistance()

  if (!place) return null

  const handleSavePlace = () => {
    onSavePlace()
    setIsSaved(true)
  }

  // Function to handle image loading errors
  const handleImageError = () => {
    setImageError(true)

    // If the current image fails, try the next one
    if (placeImages.length > 1 && currentImageIndex < placeImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else {
      // If all images fail
      // Set a fallback image
      setPlaceImages([getPlaceTypeFallbackImage(place)])
    }
  }

  return (
    <Card className="w-full overflow-hidden shadow-lg">
      {/* Header with back button and place name */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-lg truncate">{place.name || "Unnamed Place"}</h2>
        </div>
      </div>

      {/* Place image or placeholder */}
      <div className="h-48 bg-gray-200 relative">
        {isLoadingImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <img
              src={placeImages[currentImageIndex] || getPlaceTypeFallbackImage(place)}
              alt={place.name || "Place"}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />

            {/* Image navigation controls */}
            {placeImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full"
                  onClick={prevImage}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full"
                  onClick={nextImage}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </>
        )}

        {/* Image attribution overlay */}
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
          {imageError ? <span>Image not available</span> : <span>© Image sources</span>}
        </div>

        {/* Map toggle button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 bg-white bg-opacity-80"
          onClick={toggleMapView}
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          {showMap ? "Show Photos" : "Show Map"}
        </Button>
      </div>

      {/* Place title and rating */}
      <div className="p-4">
        <h1 className="text-xl font-bold">{place.name || "Unnamed Place"}</h1>
        <div className="flex items-center mt-1">
          <div className="flex items-center">
            <span className="text-lg font-semibold mr-1">{rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
          </div>
          <span className="text-gray-500 ml-2">({reviewCount})</span>
        </div>
        <div className="mt-1">
          <Badge variant="outline" className="text-xs">
            {formatType()}
          </Badge>
        </div>

        {/* Distance from user */}
        {distance !== null && (
          <div className="mt-2 text-sm text-gray-600 flex items-center">
            <Navigation className="h-4 w-4 mr-1 text-gray-500" />
            <span>{distance} km from your location</span>
          </div>
        )}

        {/* Route information */}
        {routeInfo && (
          <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-100">
            <div className="flex items-center text-blue-800">
              <Route className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Route calculated:</span>
            </div>
            <div className="text-sm text-blue-700 mt-1">
              <p>Distance: {routeInfo.distance.toFixed(2)} km</p>
              <p>Estimated time: {routeInfo.duration.toFixed(0)} min</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-around p-2 border-t border-b">
        <Button variant="ghost" size="sm" className="flex flex-col items-center h-auto py-2" onClick={onGetDirections}>
          <Navigation className="h-5 w-5 mb-1" />
          <span className="text-xs">Directions</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center h-auto py-2"
          onClick={handleSavePlace}
          disabled={isSaved || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 mb-1 animate-spin" />
              <span className="text-xs">Saving...</span>
            </>
          ) : (
            <>
              <Bookmark className={`h-5 w-5 mb-1 ${isSaved ? "fill-current" : ""}`} />
              <span className="text-xs">{isSaved ? "Saved" : "Save"}</span>
            </>
          )}
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center h-auto py-2" onClick={onSharePlace}>
          <Share2 className="h-5 w-5 mb-1" />
          <span className="text-xs">Share</span>
        </Button>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="p-4 space-y-4">
          {/* Address */}
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">{formatAddress()}</p>
              <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                Copy address
              </Button>
            </div>
          </div>

          {/* Opening hours */}
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center">
                <p className="text-sm font-medium">
                  {place.tags?.opening_hours?.includes("open") ? "Open" : "Closed"} ·
                </p>
                <Button variant="link" className="h-auto p-0 text-xs text-blue-600 ml-1">
                  Hours
                </Button>
              </div>
              <div className="mt-1 text-sm text-gray-600">{formatOpeningHours()}</div>
            </div>
          </div>

          {/* Phone */}
          {place.tags?.phone && (
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">{formatPhone()}</p>
                <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                  Call
                </Button>
              </div>
            </div>
          )}

          {/* Website */}
          {place.tags?.website && (
            <div className="flex items-start space-x-3">
              <Globe className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm truncate max-w-[200px]">{place.tags.website}</p>
                <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                  Visit website
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="p-4">
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">No reviews available yet</p>
          </div>
        </TabsContent>

        <TabsContent value="about" className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Type</h3>
              <p className="text-sm mt-1">{formatType()}</p>
            </div>

            {Object.entries(place.tags || {})
              .filter(([key]) => !["name", "phone", "website", "opening_hours"].includes(key))
              .slice(0, 5)
              .map(([key, value]) => (
                <div key={key}>
                  <h3 className="font-medium text-sm">{formatCategory(key)}</h3>
                  <p className="text-sm mt-1">{value as string}</p>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
