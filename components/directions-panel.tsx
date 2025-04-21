"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Car, FootprintsIcon as Walking, Bike, Bus, X, ArrowRight } from "lucide-react"

interface DirectionsPanelProps {
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number; name: string; place_id?: string }
  onClose: () => void
}

export default function DirectionsPanel({ origin, destination, onClose }: DirectionsPanelProps) {
  const [travelMode, setTravelMode] = useState("driving")
  const [directions, setDirections] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDirections()
  }, [travelMode])

  const fetchDirections = async () => {
    setIsLoading(true)
    try {
      // Determine if we should use place_id or coordinates
      const dest = destination.place_id ? `place_id:${destination.place_id}` : `${destination.lat},${destination.lng}`

      const response = await fetch(
        `/api/places/directions?origin=${origin.lat},${origin.lng}&destination=${dest}&mode=${travelMode}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch directions")
      }

      const data = await response.json()

      if (data.status !== "OK") {
        toast({
          title: "Directions not available",
          description: `Could not find directions: ${data.status}`,
          variant: "destructive",
        })
        return
      }

      setDirections(data)
    } catch (error) {
      console.error("Error fetching directions:", error)
      toast({
        title: "Error",
        description: "Could not load directions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTravelModeIcon = () => {
    switch (travelMode) {
      case "driving":
        return <Car className="h-4 w-4" />
      case "walking":
        return <Walking className="h-4 w-4" />
      case "bicycling":
        return <Bike className="h-4 w-4" />
      case "transit":
        return <Bus className="h-4 w-4" />
      default:
        return <Car className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Directions to {destination.name}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={travelMode} onValueChange={setTravelMode}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select travel mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="driving">
                <div className="flex items-center">
                  <Car className="mr-2 h-4 w-4" />
                  Driving
                </div>
              </SelectItem>
              <SelectItem value="walking">
                <div className="flex items-center">
                  <Walking className="mr-2 h-4 w-4" />
                  Walking
                </div>
              </SelectItem>
              <SelectItem value="bicycling">
                <div className="flex items-center">
                  <Bike className="mr-2 h-4 w-4" />
                  Bicycling
                </div>
              </SelectItem>
              <SelectItem value="transit">
                <div className="flex items-center">
                  <Bus className="mr-2 h-4 w-4" />
                  Transit
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : directions ? (
          <div className="space-y-4">
            {directions.routes[0] && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getTravelModeIcon()}
                    <span className="ml-2 font-medium">{directions.routes[0].legs[0].duration.text}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{directions.routes[0].legs[0].distance.text}</span>
                </div>

                <div className="space-y-2">
                  {directions.routes[0].legs[0].steps.map((step: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4 py-1">
                      <div className="text-sm" dangerouslySetInnerHTML={{ __html: step.html_instructions }} />
                      <div className="text-xs text-muted-foreground mt-1">
                        {step.distance.text} · {step.duration.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">Directions provided by Google</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=${travelMode}`,
                        "_blank",
                      )
                    }
                  >
                    Open in Google Maps
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Select a travel mode to see directions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
