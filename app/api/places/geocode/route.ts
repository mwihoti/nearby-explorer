import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
  }

  try {
    // Use Google's Geocoding API to convert address to coordinates
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Geocoding API error: ${data.status}`)
    }

    // Return the geocoded results
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error geocoding address:", error)
    return NextResponse.json({ error: "Failed to geocode address" }, { status: 500 })
  }
}
