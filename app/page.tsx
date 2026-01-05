"use client"

import type React from "react"

import { Zap, Bug, Eye, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">NearScope</div>
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Download
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Debug NEAR
              <br />
              with clarity
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Inspect smart contracts, visualize async execution, and understand transaction flows on NEAR Protocol.
              Built for developers, by developers.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/app">
              <Button size="lg" className="gap-2">
                <Zap className="w-4 h-4" />
                Launch the app
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <FeatureCard
            icon={<Eye className="w-6 h-6" />}
            title="Contract Inspector"
            description="View deployed contracts, metadata, and recent activity instantly"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="View Function Caller"
            description="Call view methods without a wallet, see decoded responses"
          />
          <FeatureCard
            icon={<Bug className="w-6 h-6" />}
            title="Async Debugger"
            description="Visualize receipt chains and promise execution order"
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="No Backend"
            description="Works with public NEAR RPC endpoints only"
          />
        </div>

        {/* Why Section */}
        <div className="mt-20 border-t border-border pt-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">Why NearScope?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              NEAR's asynchronous execution model is powerful but difficult to debug. NearScope brings clarity to your
              smart contract development by answering the questions that matter:
            </p>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary">→</span>
                <span>What actually happened during this transaction?</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">→</span>
                <span>Which promise failed and why?</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">→</span>
                <span>Where was gas consumed across receipts?</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">→</span>
                <span>What logs were emitted across cross-contract calls?</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted-foreground">
          <p>
            © 2026 NearScope. Built by{" "}
            <a
              href="https://gideonjones.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              Gideon Jones
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
