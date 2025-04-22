import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromLat = Number.parseFloat(searchParams.get("fromLat") || "0")
    const fromLng = Number.parseFloat(searchParams.get("fromLng") || "0")
    const toLat = Number.parseFloat(searchParams.get("toLat") || "0")
    const toLng = Number.parseFloat(searchParams.get("toLng") || "0")

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return NextResponse.json(
        { success: false, error: "Origin and destination coordinates are required" },
        { status: 400 },
      )
    }

    // Use OSRM public API for routing
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`,
    )

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      return NextResponse.json({ success: false, error: "No route found" }, { status: 404 })
    }

    const route = data.routes[0]

    // Convert distance to km and duration to minutes
    const distanceKm = Math.round(route.distance / 100) / 10
    const durationMin = Math.round(route.duration / 60)

    return NextResponse.json({
      success: true,
      data: {
        distance: distanceKm,
        duration: durationMin,
        route: route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]),
      },
    })
  } catch (error) {
    console.error("Error in directions API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch directions",
      },
      { status: 500 },
    )
  }
}
