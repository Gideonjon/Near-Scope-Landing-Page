import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "NearScope - NEAR Protocol Developer Tool",
  description: "Inspect contracts, debug async execution, and analyze transactions on NEAR",
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
