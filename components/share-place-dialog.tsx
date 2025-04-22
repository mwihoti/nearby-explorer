"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Copy, Check, Share2, QrCode, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SharePlaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  place: any
  userId: string
}

export function SharePlaceDialog({ open, onOpenChange, place, userId }: SharePlaceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [googleMapsUrl, setGoogleMapsUrl] = useState("")
  const [osmUrl, setOsmUrl] = useState("")

  useEffect(() => {
    if (place && place.lat && place.lng) {
      // Create Google Maps URL
      const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
      setGoogleMapsUrl(gmapsUrl)

      // Create OpenStreetMap URL
      const osmUrl = `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}&zoom=16`
      setOsmUrl(osmUrl)
    }
  }, [place])

  const handleShare = async () => {
    if (!place) return

    setLoading(true)
    try {
      const response = await fetch("/api/places/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          place,
          userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Create a proper absolute URL using window.location
        const baseUrl = window.location.origin
        const shareUrl = `${baseUrl}/shared/${data.data.shareId}`
        setShareUrl(shareUrl)

        // Generate QR code URL using a public API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
        setQrCodeUrl(qrUrl)

        toast.success({
          title: "Place shared successfully",
          description: "You can now share this link with others",
        })
      } else {
        throw new Error(data.error || "Failed to share place")
      }
    } catch (error) {
      console.error("Error sharing place:", error)
      toast.error({
        title: "Error",
        description: "Failed to share place. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.default({
      title: "Copied to clipboard",
      description: "The link has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaNavigator = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${place.name || "this place"} on Nearby Explorer`,
          text: `I found ${place.name || "this place"} and thought you might be interested!`,
          url: url,
        })
        toast.success({
          title: "Shared successfully",
        })
      } catch (error) {
        console.error("Error sharing via navigator:", error)
      }
    } else {
      copyToClipboard(url)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle>Share {place?.name || "this place"}</DialogTitle>
          <DialogDescription>Share this location with others in multiple ways</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <Button onClick={handleShare} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating share options...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Generate share options
                </>
              )}
            </Button>
          ) : (
            <Tabs defaultValue="app" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="app">App Link</TabsTrigger>
                <TabsTrigger value="maps">Maps</TabsTrigger>
                <TabsTrigger value="qr">QR Code</TabsTrigger>
              </TabsList>

              <TabsContent value="app" className="space-y-4 mt-4">
                <div className="text-sm text-gray-500 mb-2">Share a direct link to this location in our app:</div>
                <div className="flex items-center space-x-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button size="icon" onClick={() => copyToClipboard(shareUrl)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                {navigator.share && (
                  <Button
                    onClick={() => shareViaNavigator(shareUrl, place?.name || "Shared location")}
                    className="w-full"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share via...
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="maps" className="space-y-4 mt-4">
                <div className="text-sm text-gray-500 mb-2">Open this location in popular map services:</div>
                <div className="space-y-3">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                        <span>Google Maps</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(googleMapsUrl, "_blank")}>
                          Open
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(googleMapsUrl)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span>OpenStreetMap</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(osmUrl, "_blank")}>
                          Open
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(osmUrl)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="qr" className="space-y-4 mt-4">
                <div className="text-sm text-gray-500 mb-2">Scan this QR code to open the location:</div>
                <div className="flex justify-center">
                  {qrCodeUrl && (
                    <div className="border p-2 rounded-md bg-white">
                      <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
                    </div>
                  )}
                </div>
                <div className="text-center text-xs text-gray-500">
                  {place?.name || "Location"} • {place?.lat?.toFixed(6)}, {place?.lng?.toFixed(6)}
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => window.open(qrCodeUrl, "_blank")}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
