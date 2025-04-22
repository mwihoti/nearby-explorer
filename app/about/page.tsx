import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Compass, MapPin, Navigation, Share2, Bookmark, Globe, Github } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">About Nearby Explorer</h1>
        <p className="text-muted-foreground text-lg">Discover and share interesting places around you</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Our Mission
          </CardTitle>
          <CardDescription>
            Helping people discover the world around them, one location at a time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Nearby Explorer was created with a simple goal: to help people discover interesting places around them and
            share those discoveries with others. Whether you're exploring a new city, looking for a nearby restaurant, or
            trying to find the closest airport, Nearby Explorer makes it easy to find what you're looking for.
          </p>
         
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Location-Based Discovery</h3>
                  <p className="text-sm text-muted-foreground">
                    Find restaurants, hotels, attractions, and more near your current location
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Navigation className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Directions & Distance</h3>
                  <p className="text-sm text-muted-foreground">
                    Get distance and time estimates between your location and points of interest
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Share2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Advanced Sharing</h3>
                  <p className="text-sm text-muted-foreground">
                    Share places via QR codes, direct links, or popular map services
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Bookmark className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Saved Places</h3>
                  <p className="text-sm text-muted-foreground">
                    Save your favorite locations for quick access later
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Nearby Explorer uses a combination of modern web technologies to provide a seamless location discovery
            experience:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <span className="font-medium">Location Detection:</span> The app uses browser geolocation or IP-based
              location to determine your position.
            </li>
            <li>
              <span className="font-medium">Data Sources:</span> Places are fetched from OpenStreetMap's Overpass API,
              providing rich, community-maintained data.
            </li>
            <li>
              <span className="font-medium">Interactive Map:</span> Built with React Leaflet, the map interface allows
              for intuitive exploration.
            </li>
            <li>
              <span className="font-medium">Sharing System:</span> The app generates unique URLs for each location that
              can be shared via direct links, QR codes, or integration with Google Maps and OpenStreetMap.
            </li>
            <li>
              <span className="font-medium">Offline Support:</span> Local caching of recently viewed places allows for
              some offline functionality.
            </li>
          </ol>
        </CardContent>
      </Card>

     

    </div>
  )
}
