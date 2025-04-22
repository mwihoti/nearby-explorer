import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const origin = searchParams.get("origin") // "lat,lng" format
  const destination = searchParams.get("destination") // "lat,lng" or place_id format
  const mode = searchParams.get("mode") || "driving" // driving, walking, bicycling, transit

  if (!origin || !destination) {
    return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
  }

  try {
    // Use Google's Directions API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Directions API error: ${data.status}`)
    }

    // Return the directions results
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching directions:", error)
    return NextResponse.json({ error: "Failed to fetch directions" }, { status: 500 })
  }
}
