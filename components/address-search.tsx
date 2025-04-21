"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface AddressSearchProps {
  onLocationFound: (lat: number, lng: number, address: string) => void
}

export default function AddressSearch({ onLocationFound }: AddressSearchProps) {
  const [address, setAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address.trim()) return

    setIsSearching(true)

    try {
      const response = await fetch(`/api/places/geocode?address=${encodeURIComponent(address)}`)

      if (!response.ok) {
        throw new Error("Failed to geocode address")
      }

      const data = await response.json()

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        toast({
          title: "Location not found",
          description: "Could not find the specified address. Please try a different search.",
          variant: "destructive",
        })
        return
      }

      const result = data.results[0]
      const { lat, lng } = result.geometry.location
      const formattedAddress = result.formatted_address

      onLocationFound(lat, lng, formattedAddress)

      toast({
        title: "Location found",
        description: `Found: ${formattedAddress}`,
      })
    } catch (error) {
      console.error("Error searching for address:", error)
      toast({
        title: "Search error",
        description: "An error occurred while searching for the address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative flex w-full max-w-sm items-center">
      <Input
        type="text"
        placeholder="Search for an address..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="pr-10"
      />
      <Button type="submit" size="icon" variant="ghost" className="absolute right-0" disabled={isSearching}>
        <Search className={`h-4 w-4 ${isSearching ? "animate-pulse" : ""}`} />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}
