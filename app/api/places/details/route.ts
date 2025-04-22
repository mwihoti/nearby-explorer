import { NextResponse } from "next/server"
import { getPlaceDetails } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get("id")

    if (!placeId) {
      return NextResponse.json({ success: false, error: "Place ID is required" }, { status: 400 })
    }

    const placeDetails = await getPlaceDetails(placeId)

    // Always return success even if we're using fallback data
    return NextResponse.json({
      success: true,
      data: placeDetails,
    })
  } catch (error) {
    console.error("Error in place details API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch place details",
      },
      { status: 500 },
    )
  }
}
