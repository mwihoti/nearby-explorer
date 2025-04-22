"use client"
import { useEffect } from "react"
import { Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import { Button } from "@/components/ui/button"
import { Navigation } from "lucide-react"

// Custom icons for different place types (reuse from map-component.tsx)
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

// Icon for selected place
const selectedPlaceIcon = L.divIcon({
  className: "selected-place-icon",
  html: `<div style="background-color: #EF4444; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
          <div style="color: white; font-size: 16px; font-weight: bold;">📍</div>
        </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
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
const getIconForPlace = (place: any, isSelected: boolean) => {
  if (isSelected) {
    return selectedPlaceIcon
  }

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

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

interface ClusteredMapMarkersProps {
  places: any[]
  selectedPlace: any | null
  effectiveLocation: [number, number] | null
  onPlaceSelect: (place: any) => void
  onGetDirections: (from: [number, number], to: [number, number]) => void
}

export function ClusteredMapMarkers({
  places,
  selectedPlace,
  effectiveLocation,
  onPlaceSelect,
  onGetDirections,
}: ClusteredMapMarkersProps) {
  const map = useMap()

  // Create custom cluster icon
  const createClusterCustomIcon = (cluster: any) =>
    L.divIcon({
      html: `<div class="cluster-marker">${cluster.getChildCount()}</div>`,
      className: "custom-marker-cluster",
      iconSize: L.point(40, 40, true),
    })

  // If there's a selected place, ensure it's visible
  useEffect(() => {
    if (selectedPlace && map) {
      map.setView([selectedPlace.lat, selectedPlace.lng], map.getZoom())
    }
  }, [selectedPlace, map])

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterCustomIcon}
      maxClusterRadius={60}
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}
      zoomToBoundsOnClick={true}
    >
      {places.map((place) => {
        const isSelected = selectedPlace?.id === place.id
        const distance = effectiveLocation
          ? calculateDistance(effectiveLocation[0], effectiveLocation[1], place.lat, place.lng)
          : null

        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={getIconForPlace(place, isSelected)}
            eventHandlers={{
              click: () => onPlaceSelect(place),
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{place.name || "Unnamed Place"}</h3>
                <p className="text-xs">{place.type}</p>
                {place.address && (
                  <p className="text-xs mt-1">{Object.values(place.address).filter(Boolean).join(", ")}</p>
                )}
                {distance !== null && <p className="text-xs mt-1 font-medium">Distance: {distance} km</p>}
                <div className="flex flex-col space-y-2 mt-2">
                  <Button size="sm" variant="outline" className="w-full" onClick={() => onPlaceSelect(place)}>
                    View Details
                  </Button>
                  {effectiveLocation && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={() => onGetDirections(effectiveLocation, [place.lat, place.lng])}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Get Directions
                    </Button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MarkerClusterGroup>
  )
}
