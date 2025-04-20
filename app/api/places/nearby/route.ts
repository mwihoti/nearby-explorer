import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "5000" // Default 5 km
    const type = searchParams.get("type") || "all"

    if (!lat || !lng) {
        return NextResponse.json({ error: "Latitude and longitude are required"}, {status: 400})
    }

    try {
        // construct the google places api url
        const apiKey = process.env.GOOGLE_MAPS_API_KEY 

        // Determine the tye of google places api
        let placeType = ""
        if (type !== "all") {
            // Map our app's types to google places API types
            switch (type) {
                case "cafe":
                    placeType = "resturant, cafe"
                    break
                case "landmark":
                    placeType = "tourist_attraction,museum"
                    break
                case "nature":
                    placeType = "park,natural_feature"
                    break
            }
        }

        // Build the url with proper type parameter
        const typeParam = placeType ? `&type=${placeType}` : ""
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}${typeParam}&key=${apiKey}`

        // make the request to google places api
        const response = await fetch(url)
        const data = await response.json()

        // Return the response from google places api
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error fetching places:", error)
        return NextResponse.json({ error: "Failed to fetch nearby places"}, {status: 500})
    }
}