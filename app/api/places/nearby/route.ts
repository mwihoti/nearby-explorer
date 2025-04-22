import { NextResponse } from "next/server"
import { searchNearbyPlaces } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseInt(searchParams.get("radius") || "5000") // Default to 5km
    const category = searchParams.get("category") || undefined

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: "Latitude and longitude are required" }, { status: 400 })
    }

    const places = await searchNearbyPlaces(lat, lng, radius, category)

    // Store places in global cache for fallback
    if (typeof global !== "undefined" && global.placesCache) {
      global.placesCache = places
    }

    return NextResponse.json({
      success: true,
      data: places,
    })
  } catch (error) {
    console.error("Error in nearby places API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch nearby places",
      },
      { status: 500 },
    )
  }
}
