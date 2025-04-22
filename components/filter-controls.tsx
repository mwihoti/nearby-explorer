"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Star, Clock } from "lucide-react"

interface FilterControlsProps {
  onFilterChange: (filterType: string, value: string) => void
  activeFilters: {
    rating: string
    hours: string
  }
}

export function FilterControls({ onFilterChange, activeFilters }: FilterControlsProps) {
  return (
    <div className="flex space-x-2 p-2 overflow-x-auto scrollbar-hide">
      {/* Rating filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>Rating</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={activeFilters.rating}
            onValueChange={(value) => onFilterChange("rating", value)}
          >
            <DropdownMenuRadioItem value="all">All ratings</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="4.5+">4.5+</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="4.0+">4.0+</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="3.5+">3.5+</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hours filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Hours</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup value={activeFilters.hours} onValueChange={(value) => onFilterChange("hours", value)}>
            <DropdownMenuRadioItem value="all">Any time</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="open_now">Open now</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="24_hours">Open 24 hours</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
