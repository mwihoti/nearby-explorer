"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, MapPin } from "lucide-react"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [savedPlaces, setSavedPlaces] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchSavedPlaces(session.user.id)
    }
  }, [session])

  const fetchSavedPlaces = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/places/saved?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setSavedPlaces(data.data)
      }
    } catch (error) {
      console.error("Error fetching saved places:", error)
    } finally {
      setLoading(false)
    }
  }

  // If not authenticated, redirect to sign in
  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  if (status === "loading" || !session) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
              <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{session.user?.name}</CardTitle>
              <CardDescription>{session.user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="saved" className="mt-6">
        <TabsList>
          <TabsTrigger value="saved">Saved Places</TabsTrigger>
          <TabsTrigger value="shared">Shared Places</TabsTrigger>
        </TabsList>
        <TabsContent value="saved" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Saved Places</CardTitle>
              <CardDescription>Places you've saved for quick access</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : savedPlaces.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {savedPlaces.map((place) => (
                    <Card key={place._id} className="overflow-hidden">
                      <div className="h-32 bg-gray-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{place.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{place.type}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2 text-gray-500">You haven't saved any places yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shared" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Shared Places</CardTitle>
              <CardDescription>Places you've shared with others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2 text-gray-500">You haven't shared any places yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
