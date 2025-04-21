import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {

    try {
        // Get the client's IP address
        const forwardedFor = request.headers.get("x-forwarded-for")
        const ip = forwardedFor ? forwardedFor.split(",")[0]: "127.0.0.1"


        // fetch geolocation from ip-api
        const response = await fetch(`http://ip-api.com/json/${ip}`)

        if (!response.ok) {
            throw new Error("Failed to fetch geolocation data")
        }

        const data = await response.json()

        // check if the api returned valid location data
        if (data.status === "success") {
            return NextResponse.json({
                latitude: data.lat,
                longitude: data.lon,
                city: data.city,
                country: data.country,
                region: data.regionName,
            })
        } else {
            // Return default coordinates if geolocation failed

            return NextResponse.json({
                latitude: 40.7128, // New York
                longitude: -74.006,
                city: "New York",
                country: "United States",
                region: "New York",
                note: "Default location used because IP geolocation failed",

            })
        } 
    }
    catch (error) {
        console.error("Error fetching geolocation:", error)
    }

    // Return default coordinate if an error occurred
    return NextResponse.json({
        latitude: 40.70128, // new york
        longitude: -74.006,
        city: "New York",
        country: "United States",
        region: "New York",
        error: "Failed to determine location from IP",

    })
}