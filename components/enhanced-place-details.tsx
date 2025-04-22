"use client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, X, MapPin, Clock, Phone, Globe, Info } from "lucide-react"

interface EnhancedPlaceDetailsProps {
  place: any
  onClose: () => void
}

export function EnhancedPlaceDetails({ place, onClose }: EnhancedPlaceDetailsProps) {
  // Format the place data based on OpenStreetMap structure
  const name = place.name || place.namedetails?.name || "Unnamed Place"
  const address = place.address || {}
  const tags = place.extratags || {}

  // Handle category/type display
  const getTypeDisplay = () => {
    if (tags.amenity) return formatCategory(tags.amenity)
    if (tags.tourism) return formatCategory(tags.tourism)
    if (tags.shop) return formatCategory(tags.shop)
    if (tags.leisure) return formatCategory(tags.leisure)
    if (tags.historic) return formatCategory(tags.historic)
    if (tags.natural) return formatCategory(tags.natural)
    return "Place"
  }

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Format address
  const formattedAddress = [
    address.road,
    address.house_number && address.road ? `#${address.house_number}` : address.house_number,
    address.suburb,
    address.city || address.town || address.village,
    address.state,
    address.postcode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ")

  // Format opening hours
  const formatOpeningHours = (hours: string) => {
    if (!hours) return null

    // Simple formatting for demo purposes
    // In a real app, you'd want to parse and format this more nicely
    return hours.split(";").map((day, i) => (
      <div key={i} className="text-xs">
        {day.trim()}
      </div>
    ))
  }

  // Format website URL for display
  const formatWebsite = (website: string) => {
    if (!website) return null

    try {
      const url = new URL(website)
      return url.hostname
    } catch (e) {
      return website
    }
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <Badge variant="outline" className="mt-1">
              {getTypeDisplay()}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Address */}
        {formattedAddress && (
          <div className="flex items-start space-x-2 mt-4">
            <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
            <p className="text-sm">{formattedAddress}</p>
          </div>
        )}

        {/* Opening Hours */}
        {tags.opening_hours && (
          <div className="flex items-start space-x-2 mt-3">
            <Clock className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Opening Hours</p>
              <div className="mt-1">{formatOpeningHours(tags.opening_hours)}</div>
            </div>
          </div>
        )}

        {/* Phone */}
        {tags.phone && (
          <div className="flex items-start space-x-2 mt-3">
            <Phone className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">
                <a href={`tel:${tags.phone}`} className="text-blue-600 hover:underline">
                  {tags.phone}
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Website */}
        {tags.website && (
          <div className="flex items-start space-x-2 mt-3">
            <Globe className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <a
                href={tags.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
              >
                <span>{formatWebsite(tags.website)}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        {/* Additional Information */}
        {Object.keys(tags).length > 0 && (
          <div className="mt-4">
            <div className="flex items-center space-x-1 mb-2">
              <Info className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium">Additional Information</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(tags)
                .filter(([key]) => !["phone", "website", "opening_hours", "name"].includes(key))
                .slice(0, 6)
                .map(([key, value]) => (
                  <div key={key} className="text-xs bg-gray-100 p-1.5 rounded">
                    <span className="font-medium">{formatCategory(key)}:</span> {value as string}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
        {place.lat && place.lon && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              window.open(`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}`, "_blank")
            }}
          >
            View on OpenStreetMap
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}

        {place.lat && place.lon && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`, "_blank")
            }}
          >
            View on Google Maps
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
