import mongoose from "mongoose"

// Define the schema
const SavedPlaceSchema = new mongoose.Schema({
  placeId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
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
  notes: String,
  savedAt: {
    type: Date,
    default: Date.now,
  },
})

// Create a compound index for userId and placeId
SavedPlaceSchema.index({ userId: 1, placeId: 1 }, { unique: true })

// Check if the model already exists to prevent overwriting
export default mongoose.models.SavedPlace || mongoose.model("SavedPlace", SavedPlaceSchema)
