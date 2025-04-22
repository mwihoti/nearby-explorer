"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Navigation, Search } from "lucide-react"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-16 pb-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-20 left-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl"></div>
        <div className="absolute bottom-10 right-1/3 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"></div>
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Explore What's <span className="text-primary">Nearby</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Discover interesting places around you, from restaurants and hotels to landmarks and hidden gems. Share
              your favorite spots with friends and family.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/explore">
              <Button size="lg" className="gap-2">
                <Navigation className="h-4 w-4" />
                Start Exploring
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Discover Places</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Find interesting locations near you with just a few taps
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Navigation className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Get Directions</h3>
              <p className="mt-2 text-sm text-muted-foreground">Find the best route to your destination</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Search Anywhere</h3>
              <p className="mt-2 text-sm text-muted-foreground">Explore locations worldwide with our powerful search</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
