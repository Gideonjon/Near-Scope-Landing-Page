"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Copy, AlertCircle, ChevronDown } from "lucide-react"

const COMMON_METHODS = [
  { name: "ft_balance_of", args: { account_id: "account.near" } },
  { name: "ft_total_supply", args: {} },
  { name: "ft_metadata", args: {} },
  { name: "nft_token", args: { token_id: "1" } },
  { name: "nft_supply_for_owner", args: { account_id: "account.near" } },
  { name: "nft_tokens_for_owner", args: { account_id: "account.near", from_index: "0", limit: "100" } },
  { name: "nft_total_supply", args: {} },
  { name: "get_balance", args: { account_id: "account.near" } },
  { name: "get_owner", args: {} },
  { name: "get_config", args: {} },
  { name: "get_state", args: {} },
]

const TEMPLATES = {
  ft_balance_of: {
    name: "FT Balance Of",
    method: "ft_balance_of",
    args: { account_id: "account.near" },
  },
  nft_token: {
    name: "NFT Token",
    method: "nft_token",
    args: { token_id: "1" },
  },
  custom: {
    name: "Custom",
    method: "",
    args: {},
  },
}

export default function ViewMethodCaller() {
  const [contractId, setContractId] = useState("")
  const [methodName, setMethodName] = useState("")
  const [args, setArgs] = useState("{}")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMethodPicker, setShowMethodPicker] = useState(false)

  const callViewMethod = async () => {
    if (!contractId.trim() || !methodName.trim()) {
      setError("Contract ID and method name are required")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let parsedArgs = {}
      try {
        parsedArgs = JSON.parse(args)
      } catch {
        setError("Invalid JSON arguments")
        setLoading(false)
        return
      }

      // Encode args to base64
      const argsBase64 = Buffer.from(JSON.stringify(parsedArgs)).toString("base64")

      const response = await fetch("https://rpc.mainnet.near.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "query",
          params: {
            request_type: "call_function",
            account_id: contractId,
            method_name: methodName,
            args_base64: argsBase64,
            finality: "optimistic",
          },
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error.message || "Method call failed")
        return
      }

      // Decode result
      const resultText = new TextDecoder().decode(new Uint8Array(result.result.result))
      try {
        setResult(JSON.parse(resultText))
      } catch {
        setResult(resultText)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey]
    setMethodName(template.method)
    setArgs(JSON.stringify(template.args, null, 2))
  }

  const selectMethod = (method: { name: string; args: Record<string, any> }) => {
    setMethodName(method.name)
    setArgs(JSON.stringify(method.args, null, 2))
    setShowMethodPicker(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>View Method Caller</CardTitle>
          <CardDescription>Call view methods without a wallet connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contract ID</label>
            <Input placeholder="contract.near" value={contractId} onChange={(e) => setContractId(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Method Name</label>
            <div className="relative">
              <Input
                placeholder="view_method_name"
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
              />
              <button
                onClick={() => setShowMethodPicker(!showMethodPicker)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              {showMethodPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                  {COMMON_METHODS.map((method) => (
                    <button
                      key={method.name}
                      onClick={() => selectMethod(method)}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b border-border last:border-b-0"
                    >
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {Object.keys(method.args).length > 0 ? Object.keys(method.args).join(", ") : "no args"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Arguments (JSON)</label>
            <textarea
              className="w-full h-24 p-2 border border-border rounded font-mono text-sm bg-muted"
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="{}"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={callViewMethod} disabled={loading}>
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              Call Method
            </Button>
            <Button variant="outline" onClick={() => applyTemplate("ft_balance_of")} size="sm">
              FT Template
            </Button>
            <Button variant="outline" onClick={() => applyTemplate("nft_token")} size="sm">
              NFT Template
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-6 border-t border-border pt-6 space-y-2">
              <p className="text-sm text-muted-foreground">Result</p>
              <div className="bg-muted p-3 rounded overflow-auto max-h-64">
                <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Result
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
