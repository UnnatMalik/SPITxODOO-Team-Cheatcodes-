"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Search } from "lucide-react"

export default function HistoryPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) { router.push("/"); return; }
        
        const response = await fetch("http://127.0.0.1:8000/api/ledger/", {
          headers: { Authorization: `Token ${token}` },
        })

        if (response.ok) {
          setLogs(await response.json())
        }
      } catch (error) {
        console.error("Failed to fetch ledger", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLedger()
  }, [router])

  // Filter Logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      (log.product_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (log.warehouse_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === "all" || log.source_type.toLowerCase() === typeFilter.toLowerCase()
    
    return matchesSearch && matchesType
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Move History</h1>
            <p className="text-muted-foreground mt-1">Audit trail of all inventory transactions</p>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Stock Ledger</CardTitle>
            <CardDescription>Complete chronological record of stock movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search Product or Warehouse..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operations</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin mx-auto"/></TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">{log.product_name}</TableCell>
                        <TableCell>{log.warehouse_name}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            log.source_type === "Receipt" ? "bg-green-100 text-green-700 border-green-200" :
                            log.source_type === "Delivery" ? "bg-orange-100 text-orange-700 border-orange-200" :
                            log.source_type === "Adjustment" ? "bg-purple-100 text-purple-700 border-purple-200" :
                            "bg-blue-100 text-blue-700 border-blue-200"
                          }`}>
                            {log.source_type} #{log.source_id}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-bold ${
                          log.change > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {log.change > 0 ? "+" : ""}{log.change}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {log.balance}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}