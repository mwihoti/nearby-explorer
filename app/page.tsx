import Hero from "@/components/hero"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Compass, Map } from "lucide-react"
import Image from "next/image"
export default function Home() {
  return (
    <div className="flex min-h-screen items-center flex-col">
     
      <main className="flex-1">
        <Hero />
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Discover the world around you</h2>
         
         
            <div className="rounded-lg border bg-background p-2">
          <Image
            src="/detailed-map-with-markers.png"
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
