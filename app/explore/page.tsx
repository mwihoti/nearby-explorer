import {ExploreMap} from "@/components/explore-map"
import { Suspense } from "react"
import ExploreLoading from "./loading"
 

export default function ExplorePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<ExploreLoading />}>
        <ExploreMap />
      </Suspense>
    </div>
  )
}
