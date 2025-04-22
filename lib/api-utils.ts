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
      // If we get a 404, return fallback data instead of throwing an error
      if (response.status === 404) {
        console.warn(`Place ID ${placeId} not found in Nominatim, using fallback data`)
        return createFallbackPlaceDetails(placeId)
      }
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting place details:", error)
    // Return fallback data instead of throwing
    return createFallbackPlaceDetails(placeId)
  }
}

// Helper function to create fallback place details
function createFallbackPlaceDetails(placeId: string) {
  // Try to find the place in our local cache first
  const cachedPlace = global.placesCache?.find((p: any) => p.id === placeId)

  if (cachedPlace) {
    return {
      ...cachedPlace,
      place_id: placeId,
      extratags: cachedPlace.tags || {},
      namedetails: { name: cachedPlace.name },
      address: cachedPlace.address || {},
    }
  }

  // If not found in cache, return generic fallback
  return {
    place_id: placeId,
    lat: 0,
    lon: 0,
    name: "Place Details",
    extratags: {
      amenity: "place",
      opening_hours: "Mo-Fr 09:00-17:00",
    },
    namedetails: {
      name: "Place Details",
    },
    address: {
      road: "Unknown Road",
      city: "Unknown City",
    },
  }
}

// Add a global cache for places to use in fallback
if (typeof global !== "undefined" && !global.placesCache) {
  global.placesCache = []
}

// Updated function to search nearby places using Overpass API with advanced filtering
export async function searchNearbyPlaces(lat: number, lng: number, radius = 1000, category?: string) {
  try {
    // Start building the Overpass query
    let query = `[out:json];`

    // Add category specific filters
    if (category) {
      switch (category.toLowerCase()) {
        case "restaurants":
          query += `
            (
              node["amenity"="restaurant"](around:${radius},${lat},${lng});
              node["amenity"="cafe"](around:${radius},${lat},${lng});
              node["amenity"="fast_food"](around:${radius},${lat},${lng});
              node["amenity"="bar"](around:${radius},${lat},${lng});
            );
          `
          break
        case "hotels":
          query += `
            (
              node["tourism"="hotel"](around:${radius},${lat},${lng});
              node["tourism"="hostel"](around:${radius},${lat},${lng});
              node["tourism"="guest_house"](around:${radius},${lat},${lng});
              node["tourism"="apartment"](around:${radius},${lat},${lng});
            );
          `
          break
        case "attractions":
          query += `
            (
              node["tourism"="attraction"](around:${radius},${lat},${lng});
              node["tourism"="museum"](around:${radius},${lat},${lng});
              node["tourism"="gallery"](around:${radius},${lat},${lng});
              node["tourism"="viewpoint"](around:${radius},${lat},${lng});
              node["historic"](around:${radius},${lat},${lng});
            );
          `
          break
        case "hospitals":
          query += `
            (
              node["amenity"="hospital"](around:${radius},${lat},${lng});
              node["amenity"="clinic"](around:${radius},${lat},${lng});
              node["amenity"="doctors"](around:${radius},${lat},${lng});
              node["healthcare"](around:${radius},${lat},${lng});
            );
          `
          break
        case "schools":
          query += `
            (
              node["amenity"="school"](around:${radius},${lat},${lng});
              node["amenity"="university"](around:${radius},${lat},${lng});
              node["amenity"="college"](around:${radius},${lat},${lng});
              node["amenity"="kindergarten"](around:${radius},${lat},${lng});
            );
          `
          break
        case "worship":
          query += `
            (
              node["amenity"="place_of_worship"](around:${radius},${lat},${lng});
            );
          `
          break
        case "shopping":
          query += `
            (
              node["shop"](around:${radius},${lat},${lng});
              node["amenity"="marketplace"](around:${radius},${lat},${lng});
              node["amenity"="mall"](around:${radius},${lat},${lng});
            );
          `
          break
        case "transport":
          query += `
            (
              node["public_transport"="station"](around:${radius},${lat},${lng});
              node["highway"="bus_stop"](around:${radius},${lat},${lng});
              node["amenity"="taxi"](around:${radius},${lat},${lng});
              node["amenity"="bus_station"](around:${radius},${lat},${lng});
              node["railway"="station"](around:${radius},${lat},${lng});
            );
          `
          break
        case "parks":
          query += `
            (
              node["leisure"="park"](around:${radius},${lat},${lng});
              node["leisure"="garden"](around:${radius},${lat},${lng});
              node["leisure"="playground"](around:${radius},${lat},${lng});
              node["natural"="park"](around:${radius},${lat},${lng});
            );
          `
          break
        case "sports":
          query += `
            (
              node["leisure"="sports_centre"](around:${radius},${lat},${lng});
              node["leisure"="stadium"](around:${radius},${lat},${lng});
              node["leisure"="pitch"](around:${radius},${lat},${lng});
              node["leisure"="swimming_pool"](around:${radius},${lat},${lng});
              node["leisure"="fitness_centre"](around:${radius},${lat},${lng});
            );
          `
          break
        case "airports":
          query += `
            (
              node["aeroway"="aerodrome"](around:${radius},${lat},${lng});
              node["aeroway"="terminal"](around:${radius},${lat},${lng});
            );
          `
          break
        default:
          // If no specific category or unknown category, search for places with names
          query += `
            (
              node["name"](around:${radius},${lat},${lng});
            );
          `
      }
    } else {
      // If no category specified, search for common POIs
      query += `
        (
          node["amenity"](around:${radius},${lat},${lng});
          node["shop"](around:${radius},${lat},${lng});
          node["tourism"](around:${radius},${lat},${lng});
          node["leisure"](around:${radius},${lat},${lng});
          node["historic"](around:${radius},${lat},${lng});
        );
      `
    }

    // Complete the query
    query += `
      out body;
    `

    console.log("Overpass query:", query)

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
    const places = data.elements.map((element: any) => ({
      id: element.id.toString(),
      name: element.tags?.name || getDefaultName(element.tags),
      lat: element.lat,
      lng: element.lon,
      type: getPlaceType(element.tags),
      address: {
        road: element.tags?.["addr:street"],
        house_number: element.tags?.["addr:housenumber"],
        city: element.tags?.["addr:city"],
        country: element.tags?.["addr:country"],
      },
      tags: element.tags,
    }))

    // Store in global cache for fallback
    if (typeof global !== "undefined" && global.placesCache) {
      global.placesCache = places
    }

    return places
  } catch (error) {
    console.error("Error searching nearby places:", error)
    throw error
  }
}

// Helper function to determine a default name if none is provided
function getDefaultName(tags: any) {
  if (!tags) return "Unnamed Place"

  // Try to generate a name based on the type of place
  if (tags.amenity) {
    return `${tags.amenity.replace("_", " ")}`.charAt(0).toUpperCase() + `${tags.amenity.replace("_", " ")}`.slice(1)
  }
  if (tags.shop) {
    return (
      `${tags.shop.replace("_", " ")} shop`.charAt(0).toUpperCase() + `${tags.shop.replace("_", " ")} shop`.slice(1)
    )
  }
  if (tags.tourism) {
    return `${tags.tourism.replace("_", " ")}`.charAt(0).toUpperCase() + `${tags.tourism.replace("_", " ")}`.slice(1)
  }
  if (tags.leisure) {
    return `${tags.leisure.replace("_", " ")}`.charAt(0).toUpperCase() + `${tags.leisure.replace("_", " ")}`.slice(1)
  }
  if (tags.historic) {
    return (
      `Historic ${tags.historic.replace("_", " ")}`.charAt(0).toUpperCase() +
      `Historic ${tags.historic.replace("_", " ")}`.slice(1)
    )
  }

  return "Unnamed Place"
}

// Helper function to determine the type of place based on tags
function getPlaceType(tags: any) {
  if (!tags) return "place"

  if (tags.amenity) return tags.amenity
  if (tags.shop) return `shop_${tags.shop}`
  if (tags.tourism) return tags.tourism
  if (tags.leisure) return tags.leisure
  if (tags.historic) return `historic_${tags.historic}`
  if (tags.natural) return tags.natural
  if (tags.highway) return tags.highway
  if (tags.railway) return tags.railway
  if (tags.aeroway) return tags.aeroway

  return "place"
}

// Function to search for airports using Overpass API
export async function searchNearbyAirports(lat: number, lng: number, radius = 50000) {
  try {
    // Airports are usually farther away, so we use a larger radius by default
    const query = `
      [out:json];
      (
        node["aeroway"="aerodrome"](around:${radius},${lat},${lng});
        way["aeroway"="aerodrome"](around:${radius},${lat},${lng});
        relation["aeroway"="aerodrome"](around:${radius},${lat},${lng});
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
