"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, X, Save, ArrowRight, Trash2 } from "lucide-react"

export default function TransfersPage() {
  const router = useRouter()
  
  // --- STATE ---
  const [transfers, setTransfers] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [stockList, setStockList] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form State
  const [fromWarehouse, setFromWarehouse] = useState("")
  const [toWarehouse, setToWarehouse] = useState("")
  const [lines, setLines] = useState<{product: string, quantity: number}[]>([])

  // --- 1. INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) { router.push("/"); return; }
        const headers = { Authorization: `Token ${token}` }

        // Fetch Transfers History
        const trfRes = await fetch("http://127.0.0.1:8000/api/transfers/", { headers })
        if (trfRes.ok) setTransfers(await trfRes.json())

        // Fetch REAL Warehouses
        const whRes = await fetch("http://127.0.0.1:8000/api/warehouses/", { headers })
        if (whRes.ok) setWarehouses(await whRes.json())

        // Fetch REAL Stock (To validate availability)
        const stockRes = await fetch("http://127.0.0.1:8000/api/stock/", { headers })
        if (stockRes.ok) setStockList(await stockRes.json())

      } catch (error) {
        console.error("Error fetching data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  // --- 2. CREATE TRANSFER LOGIC ---
  
  // Filter: Only show products that exist in the FROM warehouse
  const availableProducts = stockList.filter(
    item => item.warehouse.toString() === fromWarehouse && item.quantity > 0
  )

  const addLine = () => {
    setLines([...lines, { product: "", quantity: 1 }])
  }

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)
  }

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromWarehouse || !toWarehouse || lines.length === 0) {
      alert("Please fill all fields and add at least one item.")
      return
    }
    if (fromWarehouse === toWarehouse) {
      alert("Source and Destination cannot be the same.")
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { 
        "Content-Type": "application/json",
        Authorization: `Token ${token}` 
      }

      // A. Create Header
      const res = await fetch("http://127.0.0.1:8000/api/transfers/", {
        method: "POST",
        headers,
        body: JSON.stringify({ 
            from_warehouse: fromWarehouse, 
            to_warehouse: toWarehouse, 
            status: "draft" 
        })
      })

      if (!res.ok) throw new Error("Failed to create transfer header")
      const transfer = await res.json()

      // B. Create Items
      for (const line of lines) {
        await fetch("http://127.0.0.1:8000/api/transfer-items/", {
          method: "POST",
          headers,
          body: JSON.stringify({
            transfer: transfer.id,
            product: line.product,
            quantity: line.quantity
          })
        })
      }

      // C. Validate
      const validateRes = await fetch(`http://127.0.0.1:8000/api/transfers/${transfer.id}/validate/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` }
      })

      if (validateRes.ok) {
        alert("Transfer Created & Validated! Stock Moved.")
        setIsModalOpen(false)
        window.location.reload()
      } else {
        const err = await validateRes.json()
        alert("Created Draft, but Validation Failed: " + (err.error || "Unknown error"))
        setIsModalOpen(false)
        window.location.reload()
      }

    } catch (error) {
      alert("Network Error")
    } finally {
      setIsSaving(false)
    }
  }

  // Helper to calculate totals
  const calculateTotalQty = (items: any[]) => {
    return items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  }

  // Filter the list based on search/status
  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch = t.id.toString().includes(searchTerm) ||
                          (t.from_warehouse_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Internal Transfers</h1>
            <p className="text-muted-foreground mt-1">Move stock between warehouse locations</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Create Transfer
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Transfer Operations</CardTitle>
            <CardDescription>Monitor stock movements across your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <Input 
                  id="search" 
                  placeholder="Search by ID or Warehouse..." 
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Reference</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Total Qty</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <Loader2 className="animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No transfers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-mono text-xs">TRF/{transfer.id}</TableCell>
                        <TableCell className="font-medium">{transfer.from_warehouse_name}</TableCell>
                        <TableCell className="font-medium">{transfer.to_warehouse_name}</TableCell>
                        <TableCell className="text-right">{calculateTotalQty(transfer.items)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(transfer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              transfer.status === "done"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                            }`}
                          >
                            {transfer.status === 'done' ? 'COMPLETED' : transfer.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => alert(`Viewing Transfer #${transfer.id}`)}
                          >
                            View
                          </Button>
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

      {/* --- MODAL: CREATE TRANSFER --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-2xl border border-border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Internal Transfer</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-2">
                  <Label>From (Source)</Label>
                  <Select onValueChange={setFromWarehouse}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-center pt-6">
                    <ArrowRight className="text-muted-foreground h-6 w-6" />
                </div>

                <div className="space-y-2">
                  <Label>To (Destination)</Label>
                  <Select onValueChange={setToWarehouse}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {warehouses.filter(w => w.id.toString() !== fromWarehouse).map(w => (
                        <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-md p-4 bg-muted/10">
                <div className="flex justify-between items-center mb-2">
                  <Label>Items to Move</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addLine}>
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                </div>
                
                {!fromWarehouse && lines.length > 0 && (
                  <p className="text-xs text-orange-600 mb-2">Select Source Warehouse first to see stock.</p>
                )}

                <div className="space-y-2">
                  {lines.map((line, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select onValueChange={(v) => updateLine(index, 'product', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder={fromWarehouse ? "Select Product" : "Select Source First"} />
                          </SelectTrigger>
                          <SelectContent>
                            {/* CRITICAL FIX: 
                                Only show products available in SOURCE warehouse
                            */}
                            {availableProducts.length === 0 ? (
                                <SelectItem value="none" disabled>No Stock in Source</SelectItem>
                            ) : (
                                availableProducts.map(stockItem => (
                                  <SelectItem key={stockItem.id} value={stockItem.product.toString()}>
                                    {stockItem.product_name} (Avail: {stockItem.quantity})
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input 
                          type="number" 
                          placeholder="Qty" 
                          value={line.quantity} 
                          onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value))} 
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        const newLines = lines.filter((_, i) => i !== index)
                        setLines(newLines)
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-primary">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Move Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}