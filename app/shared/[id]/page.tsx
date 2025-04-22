import { ExploreMap } from "@/components/explore-map"
import type { Metadata } from "next"
import { getOSMStaticMapUrl } from "@/lib/image-utils"

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

      // Determine the best image to use
      let imageUrl = getOSMStaticMapUrl(place.lat, place.lng, 15, 600, 300)

      // For hotels, use a hotel image
      if (
        (place.name && place.name.toLowerCase().includes("hotel")) ||
        (place.name && place.name.toLowerCase().includes("palace")) ||
        place.tags?.tourism === "hotel" ||
        place.type === "hotel"
      ) {
        // For Decale Palace Hotel specifically
        if (place.name && place.name.toLowerCase().includes("decale palace")) {
          imageUrl =
            "https://cf.bstatic.com/xdata/images/hotel/max1024x768/327328051.jpg?k=a4b6a1a9a8e638a292b9f659b2ebb3a30b533c77a5d3b0a8d2c5b0c7b7c3f0b&o=&hp=1"
        } else {
          imageUrl =
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
        }
      }

      return {
        title: `${place.name || "Shared Location"} | Nearby Explorer`,
        description: `Check out ${place.name || "this location"} shared with you on Nearby Explorer`,
        openGraph: {
          title: `${place.name || "Shared Location"} | Nearby Explorer`,
          description: `Check out ${place.name || "this location"} shared with you on Nearby Explorer`,
          type: "website",
          images: [
            {
              url: imageUrl,
              width: 600,
              height: 300,
              alt: `Image of ${place.name || "shared location"}`,
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
