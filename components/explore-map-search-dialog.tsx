"use client"
import { Loader2, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: any[]
  loading: boolean
  onSearch: (query: string) => void
  onLocationSelect: (location: any) => void
}

export function SearchDialog({
  open,
  onOpenChange,
  searchQuery,
  setSearchQuery,
  searchResults,
  loading,
  onSearch,
  onLocationSelect,
}: SearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle>Search for a location</DialogTitle>
          <DialogDescription>Enter a city, country, or specific address to find it on the map</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Command className="rounded-lg border shadow-md">
            <CommandInput
              placeholder="Search locations..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onSearch(searchQuery)
                }
              }}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  "No locations found"
                )}
              </CommandEmpty>
              <CommandGroup>
                {searchResults.map((location, index) => (
                  <CommandItem key={index} onSelect={() => onLocationSelect(location)} className="cursor-pointer">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{location.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => onSearch(searchQuery)} disabled={loading || !searchQuery.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
