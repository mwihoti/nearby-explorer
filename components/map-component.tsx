"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Navigation } from "lucide-react"
import { ClusteredMapMarkers } from "./clustered-map-markers"

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

// Icon for user location
const userLocationIcon = L.divIcon({
  className: "user-location-icon",
  html: `<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

// Icon for manual location pin
const manualLocationIcon = L.divIcon({
  className: "manual-location-icon",
  html: `<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="color: white; font-size: 12px; font-weight: bold;">📍</div>
        </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
})

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

// Custom icons for different place types
function createCustomIcon(color: string) {
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

// Component to handle map clicks for manual location setting
function LocationPicker({ onLocationPick }: { onLocationPick: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click: (e) => {
      onLocationPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
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

interface MapComponentProps {
  mapCenter: [number, number]
  userLocation: [number, number] | null
  manualLocation: [number, number] | null
  places: any[]
  airports: any[]
  selectedPlace: any | null
  showAirports: boolean
  isPickingLocation: boolean
  routeCoordinates: [number, number][] | null
  onPlaceSelect: (place: any) => void
  onAirportSelect: (airport: any) => void
  onCenterChange: (center: [number, number]) => void
  onManualLocationSet: (location: [number, number]) => void
  onGetDirections: (from: [number, number], to: [number, number]) => void
}

// Map component
export default function MapComponent({
  mapCenter,
  userLocation,
  manualLocation,
  places,
  airports,
  selectedPlace,
  showAirports,
  isPickingLocation,
  routeCoordinates,
  onPlaceSelect,
  onAirportSelect,
  onCenterChange,
  onManualLocationSet,
  onGetDirections,
}: MapComponentProps) {
  const mapRef = useRef<any>(null)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)

  // Get the effective location (manual location if set, otherwise user location)
  const effectiveLocation = manualLocation || userLocation

  // Set map instance when it's ready
  const onMapReady = (map: L.Map) => {
    setMapInstance(map)
  }

  // Fit map to route when route changes
  useEffect(() => {
    if (mapInstance && routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates)
      mapInstance.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [mapInstance, routeCoordinates])

  // Add custom CSS for the cluster markers
  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.textContent = `
        .custom-marker-cluster {
          background: transparent;
          border: none;
        }
        .cluster-marker {
          width: 40px;
          height: 40px;
          background-color: rgba(59, 130, 246, 0.8);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
      `
      document.head.appendChild(style)
      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
      whenReady={(map) => onMapReady(map.target)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Location picker mode message */}
      {isPickingLocation && mapInstance && (
        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white p-2 z-[1000] text-center">
          Click anywhere on the map to set your location
        </div>
      )}

      {/* Location picker handler */}
      {isPickingLocation && (
        <LocationPicker
          onLocationPick={(lat, lng) => {
            onManualLocationSet([lat, lng])
          }}
        />
      )}

      {/* User location marker */}
      {userLocation && (
        <>
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">Your Location (GPS)</p>
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

      {/* Manual location marker */}
      {manualLocation && (
        <>
          <Marker position={manualLocation} icon={manualLocationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-medium">Your Manual Location</p>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={manualLocation}
            radius={100}
            pathOptions={{ color: "#EF4444", fillColor: "#FCA5A5", weight: 1 }}
          />
        </>
      )}

      {/* Route polyline */}
      {routeCoordinates && routeCoordinates.length > 1 && (
        <Polyline positions={routeCoordinates} color="#3B82F6" weight={4} opacity={0.7} />
      )}

      {/* Place markers with clustering */}
      <ClusteredMapMarkers
        places={places}
        selectedPlace={selectedPlace}
        effectiveLocation={effectiveLocation}
        onPlaceSelect={onPlaceSelect}
        onGetDirections={onGetDirections}
      />

      {/* Airport markers */}
      {showAirports &&
        airports.map((airport) => {
          const distance = effectiveLocation
            ? calculateDistance(effectiveLocation[0], effectiveLocation[1], airport.lat, airport.lng)
            : null

          return (
            <Marker
              key={airport.id}
              position={[airport.lat, airport.lng]}
              icon={placeIcons.airport}
              eventHandlers={{
                click: () => onAirportSelect(airport),
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{airport.name}</h3>
                  {airport.code && <p className="text-xs">{airport.code}</p>}
                  {distance !== null && <p className="text-xs mt-1 font-medium">Distance: {distance} km</p>}
                  <div className="flex flex-col space-y-2 mt-2">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => onAirportSelect(airport)}>
                      View Flight Info
                    </Button>
                    {effectiveLocation && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full flex items-center justify-center"
                        onClick={() => onGetDirections(effectiveLocation, [airport.lat, airport.lng])}
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

      <UpdateMapCenter center={mapCenter} />
    </MapContainer>
  )
}
