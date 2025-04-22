"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Coffee, Heart, Landmark, MapPin, Star, Trees } from "lucide-react"
import { useState } from "react"

// Mock data for saved places
const mockSavedPlaces = [
  {
    id: "1",
    name: "Central Park Cafe",
    description: "A cozy cafe with a view of the park",
    type: "cafe",
    tags: ["Cozy", "Quiet", "Coffee"],
    rating: 4.5,
    distance: 0.8,
    image: "/bustling-cafe-terrace.png",
  },
  {
    id: "3",
    name: "Riverside Park",
    description: "Beautiful park along the river",
    type: "nature",
    tags: ["Outdoor", "Scenic", "Peaceful"],
    rating: 4.6,
    distance: 1.5,
    image: "/tree-lined-riverwalk.png",
  },
]

export default function SavedPlacesPage() {

    const { data: session } = useSession()
    const [savedPlaces, setSavedPlaces] = useState(mockSavedPlaces)

    // Functiin to remove save place
    const removeSavedPlace = (id: string) => {
        setSavedPlaces(savedPlaces.filter((place) => place.id !== id))
    }


    //function to remove a saved place
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
{/*
    if (!session) {
        return (
            <div className="container flex h-screen w-screen flex-col items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Sign in required</CardTitle>
                        <CardDescription>You nedd to be signed in to view your saved places.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/login">
                        <Button className="w-full">Sign In</Button></Link>
                    </CardContent>
                </Card>
            </div>
        )
    }*/}

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Saved places</h1>
                <Link href="/explore">
                <Button>Explore More places</Button>
                </Link>
            </div>

            {savedPlaces.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Heart className="h-12 w-12 text-muted-foreground mb-4"/>
                        <h2 className="text-xl font-medium mb-2">No Saved places </h2>
                        <p className="text-muted-foreground mb-4">Start explorin and save places you'd like to visit later.</p>
                        <Link href="/explore">
                        <Button>Discover places</Button></Link>
                    </CardContent>
                </Card>
            ) : (

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {savedPlaces.map((place) => (
                        <Card key={place.id} className="overflow-hidden">
                            <div className="relative h-48">
                                <img src={place.image || "/placeholder.sv"} alt={place.name}
                                className="w-full h-full object-cover" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-background/80 hover:bg-background/90"
                                    onClick={() => removeSavedPlace(place.id)}
                                    >
                                        <Heart className="h-4 w-4 fill-primary text-primary" />
                                    </Button>
                            </div>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-1 mb-2">
                                    {getPoiIcon(place.type)}
                                    <h3 className="font-medium">{place.name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{place.description}</p>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-primary text-primary" />
                                        <span className="text-sm text-muted-foreground">{place.distance} km away</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {place.tags.map((tag, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1">
                                            View Details
                                        </Button>
                                        <Button className="flex-1">Get Directions</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
            )}
        </div>
    )

}