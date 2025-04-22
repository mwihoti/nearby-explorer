import { NextResponse } from "next/server"
import { searchNearbyAirports } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseInt(searchParams.get("radius") || "50000") // Default to 50km

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: "Latitude and longitude are required" }, { status: 400 })
    }

    const airports = await searchNearbyAirports(lat, lng, radius)

    return NextResponse.json({
      success: true,
      data: airports,
    })
  } catch (error) {
    console.error("Error in nearby airports API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch nearby airports",
      },
      { status: 500 },
    )
  }
}
