import Hero from "@/components/hero"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Compass, Map } from "lucide-react"
import Image from "next/image"
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 font-bold">
          <Compass className="h-5 w-5 text-primary" />
          <span>NearbyExplorer</span>
        </div>
        <nav className="flex flex-1 items-center justify-end space-x-2">
          <Link href="/explore">
          <Button variant="ghost" className="text-sm">
            Explore
          </Button>
          </Link>
          <Link href="/about">
          <Button variant="ghost" className="text-sm">
            About
          </Button>

          </Link>
          <ModeToggle />
          <UserNav />
        </nav>
      </div>
      </header>
      <main className="flex-1">
        <Hero />
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Discover the world around you</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              NearbyExplorer helps you find attractions, cafes, landmarks, hidden gems, and airports based on your current location.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/explore">
              <Button className="gap-1">
                <Map className="h-4 w-4" />
                Start Exploring
                </Button></Link>
                <Link href="/login">
                <Button variant="outline">Sign In</Button>
                </Link>
            </div>
          </div>
        </section>
        <section className="container py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features that make exploration easy</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover new places with our intuitive interface and powerful features.</p>
            </div>
            <ul className="grid gap-6">
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold">Geolocation Detection</h3>
                  <p className="text-muted-foreground">
                    Automatically find your current location or manually search for the place.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold">Interactive Maps</h3>
                  <p className="text-muted-foreground">
                    Explore an interactive map with points of interest clearly marked.
                  </p>
                </div>
              </li>
              <li>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold">Airport & Flight info</h3>
                  <p className="text-muted-foreground">Find nearby airports and check flight information</p>
                </div>
              </li>
            </ul>
          </div>
        <div className="rounded-lg border bg-background p-2">
          <Image
            src="/detailed-map-with-m            fix: Correct Date constructor syntax in homepage footer
            
            - Fix syntax error in copyright year display
            - Replace incorrect new.Date() with proper new Date() constructorarkers.png"
            width={550}
            height={550}
            alt="Map interface with location markers"
            className="aspect-square rounded-md object-cover"
            />

        </div>
        </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NearbyExplorer. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Terms</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Privacy </Link>
          </div>
        </div>

        </footer>
    </div>
    
  );

}
