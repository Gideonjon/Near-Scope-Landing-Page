"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ContractInspector from "@/components/nearscope/contract-inspector"
import ViewMethodCaller from "@/components/nearscope/view-method-caller"
import TransactionDebugger from "@/components/nearscope/transaction-debugger"

export default function AppPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-75 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">Back</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">NearScope</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="inspector" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inspector">Contract Inspector</TabsTrigger>
            <TabsTrigger value="viewer">View Methods</TabsTrigger>
            <TabsTrigger value="debugger">Transaction Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="inspector" className="space-y-4">
            <ContractInspector />
          </TabsContent>

          <TabsContent value="viewer" className="space-y-4">
            <ViewMethodCaller />
          </TabsContent>

          <TabsContent value="debugger" className="space-y-4">
            <TransactionDebugger />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
