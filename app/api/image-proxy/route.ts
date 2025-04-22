import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 })
    }

    // Validate URL to prevent abuse
    try {
      new URL(imageUrl)
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid URL" }, { status: 400 })
    }

    // Only allow certain domains for security
    const allowedDomains = [
      "staticmap.openstreetmap.de",
      "upload.wikimedia.org",
      "commons.wikimedia.org",
      "images.unsplash.com",
      "cdn.pixabay.com",
      "images.pexels.com",
      "cf.bstatic.com", // Booking.com images
      "media-cdn.tripadvisor.com",
      "exp.cdn-hotels.com",
      "photos.hotelbeds.com",
    ]

    const urlObj = new URL(imageUrl)
    if (!allowedDomains.some((domain) => urlObj.hostname.includes(domain))) {
      return NextResponse.json({ success: false, error: "Domain not allowed" }, { status: 403 })
    }

    // Fetch the image
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    // Get the image data and content type
    const imageData = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Return the image with proper headers
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error in image proxy:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to proxy image",
      },
      { status: 500 },
    )
  }
}
