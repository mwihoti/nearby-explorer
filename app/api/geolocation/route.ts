import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getLocationFromIP } from "@/lib/api-utils"

export async function GET() {
  try {
    // Get the user's IP address from the request headers
    const headersList = headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1"

    // Use ip-api.com to get location info
    const locationData = await getLocationFromIP()

    return NextResponse.json({
      success: true,
      data: locationData,
    })
  } catch (error) {
    console.error("Error in geolocation API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to determine location from IP",
      },
      { status: 500 },
    )
  }
}
