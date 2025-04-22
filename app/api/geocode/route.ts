import { NextResponse } from "next/server"
import { apiConfig, apiUrls } from "@/app/api/config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ success: false, error: "Search query is required" }, { status: 400 })
    }

    // Use OpenCage for geocoding
    const url = new URL(apiUrls.OPENCAGE_GEOCODE_URL)
    url.searchParams.append("q", query)
    url.searchParams.append("key", apiConfig.OPENCAGE_API_KEY)
    url.searchParams.append("limit", "5")

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`OpenCage API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.results.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Transform the results to a simpler format
    const locations = data.results.map((result: any) => ({
      name: result.formatted,
      lat: result.geometry.lat,
      lng: result.geometry.lng,
      components: result.components,
      bounds: result.bounds,
    }))

    return NextResponse.json({
      success: true,
      data: locations,
    })
  } catch (error) {
    console.error("Error in geocoding API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to geocode location",
      },
      { status: 500 },
    )
  }
}
