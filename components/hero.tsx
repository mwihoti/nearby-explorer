import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin } from "lucide-react"
import Image from "next/image"
export default function Hero() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-primary/10 to-background">
            <div className="container px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                Discovery Amazing Places Near You
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                Find attractions, cafes, landmarks, hidden gems and airports based on your current location.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Link href="/explore">
                                <Button size="lg" className="gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Explore Nearby
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="outline">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <Image
            src="/travel-app-exploration.png"
            width={550}
            height={550}
            alt="Travel exploration app with map and location pins"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
          />
                </div>
            </div>
        </section>
    )
}