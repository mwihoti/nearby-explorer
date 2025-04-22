"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "white",
          color: "black",
          border: "1px solid #E2E8F0",
        },
        className: "shadow-lg rounded-md",
      }}
    />
  )
}
