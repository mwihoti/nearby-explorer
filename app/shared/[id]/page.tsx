import { ExploreMap } from "@/components/explore-map"
import type { Metadata } from "next"

interface SharedPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SharedPageProps): Promise<Metadata> {
  // Fetch shared place data
  try {
    // Use absolute URL with the server's hostname
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

    const response = await fetch(`${baseUrl}/api/places/share?id=${params.id}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    const data = await response.json()

    if (data.success) {
      const place = data.data
      return {
        title: `${place.name || "Shared Location"} | Nearby Explorer`,
        description: `Check out ${place.name || "this location"} shared with you on Nearby Explorer`,
        openGraph: {
          title: `${place.name || "Shared Location"} | Nearby Explorer`,
          description: `Check out ${place.name || "this location"} shared with you on Nearby Explorer`,
          type: "website",
          images: [
            {
              url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+f00(${place.lng},${place.lat})/${place.lng},${place.lat},14,0/600x300?access_token=pk.eyJ1IjoiZGVtb21hcCIsImEiOiJja3p4aDNtY3MwMnRvMm9wMTlvNnhjcGFrIn0.eKsQQg_ZFmgXVYzV_RXYHA`,
              width: 600,
              height: 300,
              alt: `Map showing ${place.name || "shared location"}`,
            },
          ],
        },
      }
    }
  } catch (error) {
    console.error("Error fetching shared place metadata:", error)
  }

  return {
    title: "Shared Location | Nearby Explorer",
    description: "A location shared with you on Nearby Explorer",
  }
}

export default function SharedPlacePage({ params }: SharedPageProps) {
  return (
    <main>
      <ExploreMap sharedPlaceId={params.id} />
    </main>
  )
}
