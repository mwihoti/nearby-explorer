import { apiConfig, apiUrls } from "@/app/api/config"

// Function to get location from IP address using ip-api.com
export async function getLocationFromIP() {
  try {
    const response = await fetch(apiUrls.IP_API_URL)
    if (!response.ok) {
      throw new Error(`IP API error: ${response.status}`)
    }

    const data = await response.json()
    if (data.status === "fail") {
      throw new Error(`IP API failed: ${data.message}`)
    }

    return {
      lat: data.lat,
      lng: data.lon,
      city: data.city,
      country: data.country,
      regionName: data.regionName,
    }
  } catch (error) {
    console.error("Error getting location from IP:", error)
    throw error
  }
}

// Function to get geocoding data from OpenCage
export async function geocodeAddress(address: string) {
  try {
    const url = new URL(apiUrls.OPENCAGE_GEOCODE_URL)
    url.searchParams.append("q", address)
    url.searchParams.append("key", apiConfig.OPENCAGE_API_KEY)
    url.searchParams.append("limit", "1")

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`OpenCage API error: ${response.status}`)
    }

    const data = await response.json()
    if (data.results.length === 0) {
      throw new Error("No results found")
    }

    const result = data.results[0]
    return {
      lat: result.geometry.lat,
      lng: result.geometry.lng,
      formattedAddress: result.formatted,
    }
  } catch (error) {
    console.error("Error geocoding address:", error)
    throw error
  }
}

// Function to reverse geocode using OpenCage
export async function reverseGeocode(lat: number, lng: number) {
  try {
    const url = new URL(apiUrls.OPENCAGE_GEOCODE_URL)
    url.searchParams.append("q", `${lat},${lng}`)
    url.searchParams.append("key", apiConfig.OPENCAGE_API_KEY)

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`OpenCage API error: ${response.status}`)
    }

    const data = await response.json()
    if (data.results.length === 0) {
      throw new Error("No results found")
    }

    const result = data.results[0]
    return {
      formattedAddress: result.formatted,
      components: result.components,
      annotations: result.annotations,
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    throw error
  }
}

// Function to search places using Nominatim
export async function searchPlaces(query: string, lat?: number, lng?: number, radius?: number) {
  try {
    const url = new URL(`${apiUrls.NOMINATIM_URL}/search`)
    url.searchParams.append("q", query)
    url.searchParams.append("format", "json")
    url.searchParams.append("addressdetails", "1")

    // Add viewbox if lat/lng and radius provided
    if (lat && lng && radius) {
      // Convert radius from meters to degrees (approximate)
      const degRadius = radius / 111000 // ~111km per degree
      const bbox = [lng - degRadius, lat - degRadius, lng + degRadius, lat + degRadius].join(",")

      url.searchParams.append("viewbox", bbox)
      url.searchParams.append("bounded", "1")
    }

    // Add limit
    url.searchParams.append("limit", "20")

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": apiConfig.OSM_USER_AGENT,
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error searching places:", error)
    throw error
  }
}

// Function to get place details using Nominatim
export async function getPlaceDetails(placeId: string) {
  try {
    const url = new URL(`${apiUrls.NOMINATIM_URL}/details`)
    url.searchParams.append("place_id", placeId)
    url.searchParams.append("format", "json")
    url.searchParams.append("addressdetails", "1")
    url.searchParams.append("extratags", "1")
    url.searchParams.append("namedetails", "1")

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": apiConfig.OSM_USER_AGENT,
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting place details:", error)
    throw error
  }
}

// Function to search nearby places using Overpass API (more powerful than Nominatim for this use case)
export async function searchNearbyPlaces(lat: number, lng: number, radius = 1000, category?: string) {
  try {
    // Build Overpass query
    let query = `
      [out:json];
      (
        node["name"](around:${radius},${lat},${lng});
    `

    // Add category specific filters
    if (category) {
      switch (category.toLowerCase()) {
        case "restaurants":
          query += `node["amenity"="restaurant"](around:${radius},${lat},${lng});`
          break
        case "hotels":
          query += `node["tourism"="hotel"](around:${radius},${lat},${lng});`
          break
        case "attractions":
          query += `node["tourism"](around:${radius},${lat},${lng});`
          break
        case "hospitals":
          query += `node["amenity"="hospital"](around:${radius},${lat},${lng});`
          break
        case "schools":
          query += `node["amenity"="school"](around:${radius},${lat},${lng});`
          break
        case "airports":
          query += `node["aeroway"="aerodrome"](around:${radius},${lat},${lng});`
          break
      }
    }

    query += `
      );
      out body;
      >;
      out skel qt;
    `

    const response = await fetch(apiUrls.OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform data to a format similar to our original API
    return data.elements.map((element: any) => ({
      id: element.id.toString(),
      name: element.tags?.name || "Unnamed Place",
      lat: element.lat,
      lng: element.lon,
      type: element.tags?.amenity || element.tags?.tourism || element.tags?.aeroway || "place",
      address: {
        road: element.tags?.["addr:street"],
        city: element.tags?.["addr:city"],
        country: element.tags?.["addr:country"],
      },
      tags: element.tags,
    }))
  } catch (error) {
    console.error("Error searching nearby places:", error)
    throw error
  }
}

// Function to search for airports using Overpass API
export async function searchNearbyAirports(lat: number, lng: number, radius = 50000) {
  try {
    // Airports are usually farther away, so we use a larger radius by default
    const query = `
      [out:json];
      (
        node["aeroway"="aerodrome"]["iata"](around:${radius},${lat},${lng});
        way["aeroway"="aerodrome"]["iata"](around:${radius},${lat},${lng});
        relation["aeroway"="aerodrome"]["iata"](around:${radius},${lat},${lng});
      );
      out center;
    `

    const response = await fetch(apiUrls.OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform data to a more usable format
    return data.elements.map((element: any) => {
      // Handle different element types (node, way, relation)
      const latitude = element.lat || element.center?.lat
      const longitude = element.lon || element.center?.lon

      return {
        id: element.id.toString(),
        name: element.tags?.name || "Unnamed Airport",
        code: element.tags?.iata,
        lat: latitude,
        lng: longitude,
        type: "airport",
        tags: element.tags,
      }
    })
  } catch (error) {
    console.error("Error searching nearby airports:", error)
    throw error
  }
}

// Function to get mock flight data (since we don't have a real flight API)
export async function getFlightData(airportCode: string) {
  try {
    // This is a mockup - in a real app, you would use a flight API
    // For demo purposes, we'll generate some random flights
    const destinations = [
      { code: "JFK", city: "New York" },
      { code: "LAX", city: "Los Angeles" },
      { code: "LHR", city: "London" },
      { code: "CDG", city: "Paris" },
      { code: "HND", city: "Tokyo" },
      { code: "SYD", city: "Sydney" },
    ]

    const airlines = ["Air France", "British Airways", "Delta", "Emirates", "Lufthansa", "United"]

    // Generate 5-10 random flights
    const numFlights = Math.floor(Math.random() * 6) + 5
    const flights = []

    const now = new Date()

    for (let i = 0; i < numFlights; i++) {
      const destination = destinations[Math.floor(Math.random() * destinations.length)]
      const airline = airlines[Math.floor(Math.random() * airlines.length)]
      const departureTime = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000)

      flights.push({
        id: `FL-${Math.floor(Math.random() * 1000)}`,
        airline,
        flightNumber: `${airline.substring(0, 2)}${Math.floor(Math.random() * 1000)}`,
        origin: airportCode,
        destination: destination.code,
        destinationCity: destination.city,
        departureTime: departureTime.toISOString(),
        status: ["On Time", "Delayed", "Boarding", "Scheduled"][Math.floor(Math.random() * 4)],
      })
    }

    return flights
  } catch (error) {
    console.error("Error getting flight data:", error)
    throw error
  }
}
