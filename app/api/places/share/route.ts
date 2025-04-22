import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import mongoose from "mongoose"
import { nanoid } from "nanoid"

// Define a schema for shared places
const SharedPlaceSchema = new mongoose.Schema({
  shareId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(10),
  },
  placeId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  type: String,
  address: Object,
  tags: Object,
  sharedBy: String,
  sharedAt: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  },
})

// Create or get the model
const SharedPlace = mongoose.models.SharedPlace || mongoose.model("SharedPlace", SharedPlaceSchema)

// Share a place
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { place, userId } = body

    if (!place || !place.id) {
      return NextResponse.json({ success: false, error: "Place data is required" }, { status: 400 })
    }

    await dbConnect

    // Create new shared place
    const sharedPlace = new SharedPlace({
      placeId: place.id,
      name: place.name || "Unnamed Place",
      lat: place.lat,
      lng: place.lng,
      type: place.type,
      address: place.address,
      tags: place.tags,
      sharedBy: userId || "anonymous",
    })

    await sharedPlace.save()

    return NextResponse.json({
      success: true,
      data: {
        shareId: sharedPlace.shareId,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/shared/${sharedPlace.shareId}`,
      },
    })
  } catch (error) {
    console.error("Error sharing place:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to share place",
      },
      { status: 500 },
    )
  }
}

// Get a shared place by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get("id")

    if (!shareId) {
      return NextResponse.json({ success: false, error: "Share ID is required" }, { status: 400 })
    }

    await dbConnect
    const sharedPlace = await SharedPlace.findOneAndUpdate({ shareId }, { $inc: { views: 1 } }, { new: true })

    if (!sharedPlace) {
      return NextResponse.json({ success: false, error: "Shared place not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: sharedPlace,
    })
  } catch (error) {
    console.error("Error fetching shared place:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shared place",
      },
      { status: 500 },
    )
  }
}
