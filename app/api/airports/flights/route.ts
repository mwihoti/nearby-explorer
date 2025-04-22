import { NextResponse } from "next/server"
import { getFlightData } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const airportCode = searchParams.get("code")

    if (!airportCode) {
      return NextResponse.json({ success: false, error: "Airport code is required" }, { status: 400 })
    }

    const flights = await getFlightData(airportCode)

    return NextResponse.json({
      success: true,
      data: flights,
    })
  } catch (error) {
    console.error("Error in flights API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch flight data",
      },
      { status: 500 },
    )
  }
}
