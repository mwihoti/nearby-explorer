"use client"
import { Button } from "@/components/ui/button"
import {
  Utensils,
  Hotel,
  School,
  Landmark,
  AmbulanceIcon as FirstAid,
  Coffee,
  MapPin,
  ShoppingBag,
  Bus,
  Church,
  TreePine,
  Dumbbell,
  Plane,
} from "lucide-react"

interface CategorySearchProps {
  onCategorySelect: (category: string) => void
  selectedCategory: string | null
}

export function CategorySearch({ onCategorySelect, selectedCategory }: CategorySearchProps) {
  const categories = [
    { id: "restaurants", name: "Restaurants", icon: <Utensils className="h-4 w-4" /> },
    { id: "hotels", name: "Hotels", icon: <Hotel className="h-4 w-4" /> },
    { id: "attractions", name: "Attractions", icon: <Landmark className="h-4 w-4" /> },
    { id: "hospitals", name: "Hospitals", icon: <FirstAid className="h-4 w-4" /> },
    { id: "schools", name: "Schools", icon: <School className="h-4 w-4" /> },
    { id: "worship", name: "Worship", icon: <Church className="h-4 w-4" /> },
    { id: "shopping", name: "Shopping", icon: <ShoppingBag className="h-4 w-4" /> },
    { id: "transport", name: "Transport", icon: <Bus className="h-4 w-4" /> },
    { id: "parks", name: "Parks", icon: <TreePine className="h-4 w-4" /> },
    { id: "sports", name: "Sports", icon: <Dumbbell className="h-4 w-4" /> },
    { id: "airports", name: "Airports", icon: <Plane className="h-4 w-4" /> },
    { id: "cafes", name: "Cafes", icon: <Coffee className="h-4 w-4" /> },
  ]

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => onCategorySelect("")}
          className="flex items-center space-x-1"
        >
          <MapPin className="h-4 w-4" />
          <span>All</span>
        </Button>

        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategorySelect(category.id)}
            className="flex items-center space-x-1"
          >
            {category.icon}
            <span>{category.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
