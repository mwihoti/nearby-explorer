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
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              ))
            )} 
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
)

}
