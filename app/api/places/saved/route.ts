import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import SavedPlace from "@/models/SavedPlace"

// Get all saved places for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    await dbConnect
    const savedPlaces = await SavedPlace.find({ userId }).sort({ savedAt: -1 })

    return NextResponse.json({
      success: true,
      data: savedPlaces,
    })
  } catch (error) {
    console.error("Error fetching saved places:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch saved places",
      },
      { status: 500 },
    )
  }
}

// Save a place
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, place } = body

    if (!userId || !place || !place.id) {
      return NextResponse.json({ success: false, error: "User ID and place data are required" }, { status: 400 })
    }

    await dbConnect

    // Check if place is already saved
    const existingPlace = await SavedPlace.findOne({ userId, placeId: place.id })

    if (existingPlace) {
      return NextResponse.json(
        {
          success: false,
          error: "Place already saved",
          data: existingPlace,
        },
        { status: 409 },
      )
    }

    // Create new saved place
    const savedPlace = new SavedPlace({
      userId,
      placeId: place.id,
      name: place.name || "Unnamed Place",
      lat: place.lat,
      lng: place.lng,
      type: place.type,
      address: place.address,
      tags: place.tags,
      savedAt: new Date(),
    })

    await savedPlace.save()

    return NextResponse.json({
      success: true,
      data: savedPlace,
    })
  } catch (error) {
    console.error("Error saving place:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save place",
      },
      { status: 500 },
    )
  }
}

// Delete a saved place
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const placeId = searchParams.get("placeId")

    if (!userId || !placeId) {
      return NextResponse.json({ success: false, error: "User ID and place ID are required" }, { status: 400 })
    }

    await dbConnect()
    const result = await SavedPlace.findOneAndDelete({ userId, placeId })

    if (!result) {
      return NextResponse.json({ success: false, error: "Place not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { message: "Place removed from saved places" },
    })
  } catch (error) {
    console.error("Error deleting saved place:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete saved place",
      },
      { status: 500 },
    )
  }
}
