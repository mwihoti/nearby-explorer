"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Phone, Globe, ChevronLeft, Star, Navigation, Bookmark, Share2, Building } from "lucide-react"

interface PlaceInfoPanelProps {
  place: any
  onClose: () => void
  onGetDirections: () => void
}

export function PlaceInfoPanel({ place, onClose, onGetDirections }: PlaceInfoPanelProps) {
  const [isSaved, setIsSaved] = useState(false)

  // Format address components
  const formatAddress = () => {
    if (!place) return ""

    const addressParts = []
    if (place.address?.road) addressParts.push(place.address.road)
    if (place.address?.house_number) addressParts.push(place.address.house_number)
    if (place.address?.suburb) addressParts.push(place.address.suburb)
    if (place.address?.city || place.address?.town) addressParts.push(place.address?.city || place.address?.town)

    return addressParts.join(", ")
  }

  // Format place type
  const formatType = () => {
    if (!place) return "Place"

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

  // Format opening hours
  const formatOpeningHours = () => {
    if (!place?.tags?.opening_hours) return "Hours not available"

    // Simple formatting for demo
    return place.tags.opening_hours.split(";").map((day: string, i: number) => (
      <div key={i} className="text-sm">
        {day.trim()}
      </div>
    ))
  }

  // Format phone number
  const formatPhone = () => {
    return place?.tags?.phone || "Phone not available"
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

  const rating = getRating()
  const reviewCount = getReviewCount()

  if (!place) return null

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
        <img
          src={place.tags?.image || `/placeholder.svg?height=200&width=400&query=place+${formatType()}`}
          alt={place.name || "Place"}
          className="w-full h-full object-cover"
        />
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
          onClick={() => setIsSaved(!isSaved)}
        >
          <Bookmark className={`h-5 w-5 mb-1 ${isSaved ? "fill-current" : ""}`} />
          <span className="text-xs">{isSaved ? "Saved" : "Save"}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center h-auto py-2">
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
