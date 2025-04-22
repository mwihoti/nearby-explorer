// API configuration
export const apiConfig = {
    // OpenCage API Key - you'll need to get one from https://opencagedata.com/
    OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY || "",
  
    // For IP geolocation, ip-api.com doesn't require a key for limited usage
    // For OpenStreetMap/Nominatim, no API key is required but we need to set a user agent
    OSM_USER_AGENT: "NearbyExplorer/1.0",
  }
  
  // Base URLs
  export const apiUrls = {
    OPENCAGE_GEOCODE_URL: "https://api.opencagedata.com/geocode/v1/json",
    IP_API_URL: "http://ip-api.com/json",
    NOMINATIM_URL: "https://nominatim.openstreetmap.org",
    OVERPASS_URL: "https://overpass-api.de/api/interpreter",
  }
  
  // Rate limiting parameters
  export const rateLimits = {
    // Nominatim has a usage policy of max 1 request per second
    NOMINATIM_RATE_LIMIT: 1000,
    // OpenCage free tier has 2,500 requests per day
    OPENCAGE_RATE_LIMIT: 2000,
  }
  