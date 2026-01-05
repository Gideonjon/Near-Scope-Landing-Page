"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Copy, AlertCircle, ChevronDown, ChevronRight } from "lucide-react"

interface Receipt {
  id: string
  receipt: {
    Action?: {
      actions: any[]
    }
    Data?: any
  }
  outcome: {
    status: any
    logs: string[]
    gas_burnt: number
  }
  children?: Receipt[]
}

export default function TransactionDebugger() {
  const [txHash, setTxHash] = useState("")
  const [signerAccount, setSignerAccount] = useState("")
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedReceipts, setExpandedReceipts] = useState<Set<string>>(new Set())

  const fetchTransaction = async () => {
    if (!txHash.trim() || !signerAccount.trim()) {
      setError("Transaction hash and signer account are required")
      return
    }

    setLoading(true)
    setError(null)
    setReceipts([])

    try {
      const response = await fetch("https://rpc.mainnet.near.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tx",
          params: [txHash, signerAccount],
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error.message || "Failed to fetch transaction")
        return
      }

      // Build receipt tree
      const receiptMap = new Map<string, Receipt>()
      const parentMap = new Map<string, string>()

      if (result.result?.receipts) {
        for (const receipt of result.result.receipts) {
          receiptMap.set(receipt.receipt_id, {
            id: receipt.receipt_id,
            receipt: receipt,
            outcome: receipt.outcome,
            children: [],
          })

          if (receipt.parent_id) {
            parentMap.set(receipt.receipt_id, receipt.parent_id)
          }
        }

        // Build tree structure
        const rootReceipts: Receipt[] = []
        for (const [id, receipt] of receiptMap) {
          const parentId = parentMap.get(id)
          if (parentId && receiptMap.has(parentId)) {
            receiptMap.get(parentId)!.children?.push(receipt)
          } else {
            rootReceipts.push(receipt)
          }
        }

        setReceipts(rootReceipts)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const toggleReceipt = (id: string) => {
    const newExpanded = new Set(expandedReceipts)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedReceipts(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const ReceiptNode = ({ receipt, depth = 0 }: { receipt: Receipt; depth?: number }) => {
    const isExpanded = expandedReceipts.has(receipt.id)
    const hasChildren = receipt.children && receipt.children.length > 0

    return (
      <div className="space-y-2">
        <div
          className="flex items-start gap-2 p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={() => hasChildren && toggleReceipt(receipt.id)}
          style={{ marginLeft: `${depth * 16}px` }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mt-1 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-background px-2 py-1 rounded break-all">
                {receipt.id.substring(0, 16)}...
              </span>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
                  typeof receipt.outcome.status === "string" && receipt.outcome.status.toLowerCase().includes("success")
                    ? "bg-green-500/20 text-green-700"
                    : "bg-red-500/20 text-red-700"
                }`}
              >
                {typeof receipt.outcome.status === "object" ? Object.keys(receipt.outcome.status)[0] : "Success"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Gas burnt: {(receipt.outcome.gas_burnt / 1e12).toFixed(3)} Tgas
            </p>
          </div>

          <Copy
            className="w-4 h-4 flex-shrink-0 hover:opacity-75 mt-1"
            onClick={(e) => {
              e.stopPropagation()
              copyToClipboard(receipt.id)
            }}
          />
        </div>

        {isExpanded && receipt.outcome.logs.length > 0 && (
          <div className="ml-6 space-y-1 text-xs font-mono bg-background p-2 rounded border border-border">
            <p className="text-muted-foreground mb-1">Logs:</p>
            {receipt.outcome.logs.map((log, i) => (
              <p key={i} className="text-muted-foreground truncate">
                {log}
              </p>
            ))}
          </div>
        )}

        {isExpanded && hasChildren && (
          <div>
            {receipt.children!.map((child) => (
              <ReceiptNode key={child.id} receipt={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Debugger</CardTitle>
          <CardDescription>Visualize receipt execution tree and analyze transaction flow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Hash</label>
              <Input placeholder="Hash in base58 format" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Signer Account</label>
              <Input
                placeholder="account.near"
                value={signerAccount}
                onChange={(e) => setSignerAccount(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={fetchTransaction} disabled={loading}>
            {loading && <Spinner className="w-4 h-4 mr-2" />}
            Debug Transaction
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {receipts.length > 0 && (
            <div className="mt-6 border-t border-border pt-6 space-y-3">
              <p className="text-sm font-medium">Receipt Execution Tree</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {receipts.map((receipt) => (
                  <ReceiptNode key={receipt.id} receipt={receipt} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
