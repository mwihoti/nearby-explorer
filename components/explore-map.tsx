"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Compass, Search, MapPin, Coffee, Landmark, Plane, Trees, Star, Shuffle, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import Link from "next/link"


// Dynamic import for framer motion
const motion = dynamic(() => import("framer-motion").then((mod) => mod.motion), {ssr: false})

//Types for POIs and  other daata
type Lating = {
    lat: number
    lng: number
}

type POI = {
    id: string
    name: string
    location: Lating
    description: string
    type: string
    tags: string[]
    rating: number
    distance: number
    image?: string
}
type Airport = {
    id: string
    name: string
    code: string
    location: Lating
    distance: number
}
type Flight = {
    id: string
    flightNumber: string
    origin: string
    destination: string
    eta: string
    status: string
}
// Mock data for POIs
const mockPOIs: POI[] = [
    {
      id: "1",
      name: "Central Park Cafe",
      location: { lat: 40.785091, lng: -73.968285 },
      description: "A cozy cafe with a view of the park",
      type: "cafe",
      tags: ["Cozy", "Quiet", "Coffee"],
      rating: 4.5,
      distance: 0.8,
      image: "/bustling-cafe-terrace.png",
    },
    {
      id: "2",
      name: "Historic Museum",
      location: { lat: 40.779423, lng: -73.963244 },
      description: "Learn about the city's rich history",
      type: "landmark",
      tags: ["Educational", "Indoor", "Historic"],
      rating: 4.8,
      distance: 1.2,
      image: "/grand-facade-history.png",
    },
    {
      id: "3",
      name: "Riverside Park",
      location: { lat: 40.801505, lng: -73.972542 },
      description: "Beautiful park along the river",
      type: "nature",
      tags: ["Outdoor", "Scenic", "Peaceful"],
      rating: 4.6,
      distance: 1.5,
      image: "/tree-lined-riverwalk.png",
    },
    {
      id: "4",
      name: "Skyline Viewpoint",
      location: { lat: 40.748817, lng: -73.985428 },
      description: "Amazing views of the city skyline",
      type: "landmark",
      tags: ["Scenic", "Photography", "Romantic"],
      rating: 4.9,
      distance: 2.3,
      image: "/placeholder.svg?height=200&width=300&query=city skyline viewpoint",
    },
    {
      id: "5",
      name: "Hidden Garden",
      location: { lat: 40.765136, lng: -73.977618 },
      description: "A secret garden tucked away in the city",
      type: "nature",
      tags: ["Hidden", "Peaceful", "Flowers"],
      rating: 4.7,
      distance: 0.9,
      image: "/placeholder.svg?height=200&width=300&query=hidden garden with flowers",
    },
  ]
  
  // Mock data for airports
  const mockAirports: Airport[] = [
    {
      id: "1",
      name: "John F. Kennedy International Airport",
      code: "JFK",
      location: { lat: 40.641766, lng: -73.780968 },
      distance: 19.8,
    },
    {
      id: "2",
      name: "LaGuardia Airport",
      code: "LGA",
      location: { lat: 40.775103, lng: -73.872971 },
      distance: 8.6,
    },
  ]
  
  // Mock data for flights
  const mockFlights: Flight[] = [
    {
      id: "1",
      flightNumber: "AA123",
      origin: "Los Angeles (LAX)",
      destination: "New York (JFK)",
      eta: "15:30",
      status: "On Time",
    },
    {
      id: "2",
      flightNumber: "DL456",
      origin: "Chicago (ORD)",
      destination: "New York (JFK)",
      eta: "16:15",
      status: "Delayed",
    },
    {
      id: "3",
      flightNumber: "UA789",
      origin: "Miami (MIA)",
      destination: "New York (JFK)",
      eta: "17:00",
      status: "On Time",
    },
  ]

  /// component to recenter map when location changes
  function SetViewOnChange({ coords}: {coords: Lating}) {
    const map = useMap()
    useEffect(() => {
        map.setView([coords.lat, coords.lng], 14)
    }, [coords, map])
    return null
  }
  export default function ExploreMap() {

  const [userLocation, setUserLocation] = useState<Lating>({ lat: 40.7128, lng: -74.006}) // Default to NYC
  const [isLocating, setIsLocating] =useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [distance, setDistance] = useState([5]) // Default 5km radius
  const [poiType, setPoiType] = useState("all")
  const [minRating, setMinRating] = useState(0)
  const [filteredPOIs, setFilteredPOIs] = useState<POI[]>([])
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null)
  const [showAirports, setShowAirports] = useState(false)
  const [savedPlaces, setSavedPlaces] = useState<string[]>([])
  const [isMapReady, setIsMapReady] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile
  const { data: session } = useSession()
  const mapRef = useRef(null)

  // Get user's location on component mount
{/*
  useEffect(() => {
    locateUser()
  }, [])*/}

  // Filter POIs based on user selections
  useEffect(() => {
    let filtered = mockPOIs

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (poi) => 
            poi.name.toLowerCase().includes(searchQuery.toLowerCase() || 
      poi.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    poi.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    }

    // Filter by POI type
    if (poiType !== "all") {
      filtered = filtered.filter((poi) => poi.type === poiType)
    }

    // Filter by distance
    filtered = filtered.filter((poi) => poi.distance <= distance[0])

    // filter ny rating

    filtered = filtered.filter((poi) => poi.rating >= minRating)

    setFilteredPOIs(filtered)
  }, [searchQuery, poiType, distance, minRating])

  // function to get user's location
  const locateUser = () => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude} = position.coords
          setUserLocation({ lat: latitude, lng: longitude})
          setIsLoading(false)
          toast({
            title: "Location found",
            description: "We've found your current location."
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLocating(false)
          toast({
            title: "Location error",
            desription: "Could not get your location. Please enter it manually.",
            variant: "destructive"
          })

        }
      )
    } else {
      setIsLoading(false)
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      })
    }
  }

  // function to handle POI selection
  const handlePOISelect = (poi: POI) => {
    setSelectedPOI(poi)
  }

  // function to save/unsave a place

  const toggleSavePlace = (poiId: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save places.",
        variant: "destructive"
      })
      return
    }
    if (savedPlaces.includes(poiId)) {
      setSavedPlaces(savedPlaces.filter((id) => id !== poiId))
      toast({
        title: "Place removed",
        description: "This place has been removed from your saved places.",
      })
    } else {
      setSavedPlaces([...savedPlaces, poiId])
      toast({
        title: "Place saved",
        description: "This place has been added to your saved places."
      })
    }
  }
// function to get a random POI  suggestion
const getRandomPOI = () => {
  if (filteredPOIs.length === 0) return


  const randomIndex = Math.floor(Math.random() * filteredPOIs.length)
  const randomPOI = filteredPOIs[randomIndex]

  setSelectedPOI(randomPOI)

  toast({
    title: "Explore this place!",
    description: `We suggest checking out ${randomPOI.name}`
  })
}

// Icon components for POI types
const getPoiIcon = (type: string) => {
  switch (type) {
    case "cafe":
      return <Coffee className="h-4 w-4" />
    case "landmark":
      return <Landmark className="h-4 w-4" />
    case "nature":
      return <Trees className="h-4 w-4" />
    default:
      return <MapPin className="h-4 w-4" />
  }
}

return (
  <div className="flex flex-col h-screen">
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 items-center">
      <div className="flex items-center gap-2 font-bold">
        <Compass className="h-5 w-5 text-primary" />
        <span>NearbyExplorer</span>
      </div>
      <div className="flex flex-1 items-center gap-2 md:gap-4 md:px-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search places..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
           
        </div>
        <Button variant="outline" size="icon" onClick={locateUser} disabled={isLocating}>
          <MapPin className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`} />
          <span className="sr-only">Find my location</span>
        </Button>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Link href="/">
        <Button variant="ghost" size="sm">Home</Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => getRandomPOI()}
        className="text-primary">
          <Shuffle className="h-4 w-4" />
          <span className="sr-only">Random place</span>
        </Button>
      </div>
    </div>
    </header>

    <div className="flex flex-col md:flex-row h-full">
      {/* Sidebar for filters and POI list */}
      <div className="w-full md:w-80 border-r bg-background p-4 overflow-y-auto">
        <Tabs defaultValue="places">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="places">Places</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="airports">Airports</TabsTrigger>
          </TabsList>

          <TabsContent value="places" className="space-y-4 mt-4">
            {filteredPOIs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No places found matching your criteria</p>
              </div>
            ) : (
              filteredPOIs.map((poi) => (
                <Card 
                    key={poi.id}
                    className={`cursor-pointer transition-all ${selectedPOI?.id === poi.id ? "ring-2 ring-primary" : ""}`}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1">
                              {getPoiIcon(poi.type)}
                              <h3 className="font-medium">{poi.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreround line-clamp-2 mt-1">{poi.description}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Star className="h-3 w-3 fill-primary text-preimary" />
                              <span className="text-xs">{poi.rating}</span>
                              <span className="text-xs text-muted-foreground ml-2">{poi.distance} km away</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {poi.tags.map((tag, i)=> (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSavePlace(poi.id)
                              }}>
                                <Heart className={`h-4 w-4 ${savedPlaces.includes(poi.id) ? "fill-primary text-primary" : ""}`}/>
                              </Button>
                        </div>
                      </CardContent>
                    </Card>

              ))
            )} 
          </TabsContent>
          <TabsContent value="filters" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Place Type</label>
              <Select value={poiType} onValueChange={setPoiType}>
                <SelectTrigger>
                <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Cafe">Cafes</SelectItem>       
                  <SelectItem value="landmark"> LandMarks</SelectItem>
                  <SelectItem value="nature"> Nature</SelectItem>
                </SelectContent>
                            </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="not-last-of-type:text-sm font-medium">Distance (km)</label>
               <span className="text-sm text-muted-foreground">{distance[0]} km</span>
              </div>
              <Slider value={distance} min={1} max={20} step={1} onValueChange={setDistance} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Minimum Rating</label>
                <span className="text-sm text-muted-foreground">{minRating} stars</span>
              </div>
              <Slider   
                  value={[minRating]}
                  min={0}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => setMinRating(value[0])} />
            </div>

            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => {
                setPoiType("all")
                setDistance([5])
                setMinRating(0)
                setSearchQuery("")
              }}>
                Reset filters
              </Button>
          </TabsContent>

          <TabsContent value="airports" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Nearby Airports</h3>
              <Button variant="outline" size="sm" onClick={() => setShowAirports(!showAirports)}>
                {showAirports ? "Hide on Map": "Show on Map"}
              </Button>
            </div>
            {mockAirports.map((airport) => (
              <Card key={airport.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1">
                        <Plane className="h-4 w-4" />
                        <h3 className="font-medium">{airport.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {airport.code} . {airport.distance} km away
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="mt-4">
              <h3 className="font-medium mb-2">Incoming flights</h3>
              {mockFlights.map((flight) => (
                <div key={flight.id} className="py-2 border-b last:border-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{flight.flightNumber}</span>
                    <span className={`text-sm ${flight.status === "Delayed" ? "text-destructive" : "text-primary"}`}>
                      {flight.status}
                    </span>
                    </div>
                    <div className="text-sm text-muted-foreground">From: {flight.origin} </div>
                    <div className="text-sm text-muted-foreground">ETA: {flight.eta} </div>

                  </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* Map container */}
      <div className="flex-1 relative map-container">
        {typeof window !== "undefined" && (
          <MapContainer 
            center={[userLocation.lat, userLocation.lng]}
            zoom={14}
            style={{ height: "100%", width: "100%"}}
            whenReady={() => setIsMapReady(true)}
            ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <SetViewOnChange coords={userLocation} />

                {/* User location marker */}
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-medium">Your Location</p>
                    </div>
                  </Popup>
                </Marker>

                {/* POI markers */}
                {filteredPOIs.map((poi) => (
                  <Marker key={poi.id} position={[poi.location.lat, poi.location.lng]}>
                    <Popup>
                      <div className="w-64">
                        <h3 className="font-medium text-lg">{poi.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{poi.description}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-sm">{poi.rating}</span>
                          <span className="text-sm text-muted-foreground ml-2">{poi.distance} km away</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {poi.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button className="w-full mt-3" size="sm" onClick={() => toggleSavePlace(poi.id)}>
                          {savedPlaces.includes(poi.id) ? "Unsave Place" : "Save Place"}
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {/* Airport markers */}
                {showAirports && 
                mockAirports.map((airport) => (
                  <Marker key={airport.id} position={[airport.location.lat, airport.location.lng]}>
                    <Popup>
                      <div>
                        <h3 className="font-medium">{airport.name}</h3>
                        <p className="text-sm text-muted-foreground">{airport.code}</p>
                        <p className="text-sm text-muted-foreground">{airport.distance} km away</p>

                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
        )}

        {/* Selected POI detail panel */}
        {selectedPOI && (
          <motion.div
            initial={{ x: "100%"}}
            animate={{ x: 0 }}
            className="absolute top-0 right-0 w-full md:w-96 h-full bg-background border-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{selectedPOI.name}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedPOI(null)}>
                    <span className="sr-only">Close</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </Button>
                </div>
                {selectedPOI.image && (
                  <div className="mb-4 rounded-md overflow-hidden">
                    <img 
                      src={selectedPOI.image || "/placeholder.svg"}
                      alt={selectedPOI.name}
                      className="w-full h-48 object-cover" />

                    </div>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground">{selectedPOI.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{selectedPOI.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{selectedPOI.distance} km away</span>
                  </div>


                  <div>
                    <h3 className="font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPOI.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 flex gap-2">
                    <Button className="flex-1" onClick={() => toggleSavePlace(selectedPOI.id)}>
                      <Heart className={`h-4 w-4 mr-2 ${savedPlaces.includes(selectedPOI.id) ? "fill-primary-foreground": ""}`}/>
                      {savedPlaces.includes(selectedPOI.id) ? "Saved" : "Save Place"}
                    </Button>
                    <Button variant="ouline" className="flex-1">
                      Get Directions
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
        )}
      </div>
    </div>
  </div>
)

}
