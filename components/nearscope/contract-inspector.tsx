"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Copy, AlertCircle } from "lucide-react"

interface ContractData {
  codeHash: string
  blockHeight: number
  blockTimestamp: number
  storagePaid: string
  storageUsage: string
}

export default function ContractInspector() {
  const [accountId, setAccountId] = useState("")
  const [data, setData] = useState<ContractData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContractData = async () => {
    if (!accountId.trim()) {
      setError("Please enter an account ID")
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch("https://rpc.mainnet.near.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "query",
          params: {
            request_type: "view_account",
            account_id: accountId,
            finality: "optimistic",
          },
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error.message || "Failed to fetch contract data")
        return
      }

      // Fetch code hash
      const codeResponse = await fetch("https://rpc.mainnet.near.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "query",
          params: {
            request_type: "view_code",
            account_id: accountId,
            finality: "optimistic",
          },
        }),
      })

      const codeResult = await codeResponse.json()

      setData({
        codeHash: codeResult.result?.hash || "No code deployed",
        blockHeight: result.result?.block_height || 0,
        blockTimestamp: result.result?.block_timestamp || 0,
        storagePaid: result.result?.storage_paid_at || "0",
        storageUsage: result.result?.storage_usage || "0",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contract Inspector</CardTitle>
          <CardDescription>Enter a NEAR account ID to inspect contract details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="example.near"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchContractData()}
            />
            <Button onClick={fetchContractData} disabled={loading}>
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              Inspect
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data && (
            <div className="space-y-3 mt-6 border-t border-border pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Code Hash</p>
                <div className="flex items-center gap-2 bg-muted p-3 rounded font-mono text-sm break-all">
                  {data.codeHash}
                  <Copy
                    className="w-4 h-4 cursor-pointer hover:opacity-75 flex-shrink-0"
                    onClick={() => copyToClipboard(data.codeHash)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Block Height</p>
                  <p className="font-mono text-sm">{data.blockHeight}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Storage Usage</p>
                  <p className="font-mono text-sm">{data.storageUsage} bytes</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
