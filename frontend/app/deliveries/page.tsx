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
import { Loader2, Plus, X, Save, Search, Trash2, Eye } from "lucide-react"

export default function DeliveriesPage() {
  const router = useRouter()
  
  // --- STATE ---
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [stockList, setStockList] = useState<any[]>([]) 
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form State
  const [customer, setCustomer] = useState("")
  const [warehouse, setWarehouse] = useState("")
  const [lines, setLines] = useState<{product: string, quantity: number}[]>([])

  // --- 1. INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) { router.push("/"); return; }
        const headers = { Authorization: `Token ${token}` }

        // Fetch Deliveries (includes nested items)
        const delRes = await fetch("http://127.0.0.1:8000/api/deliveries/", { headers })
        if (delRes.ok) setDeliveries(await delRes.json())

        // Fetch Warehouses
        const whRes = await fetch("http://127.0.0.1:8000/api/warehouses/", { headers })
        if (whRes.ok) setWarehouses(await whRes.json())

        // Fetch Stock
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

  // --- 2. CREATE DELIVERY LOGIC ---
  const availableProducts = stockList.filter(
    item => item.warehouse.toString() === warehouse && item.quantity > 0
  )

  const addLine = () => setLines([...lines, { product: "", quantity: 1 }])

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)
  }

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer || !warehouse || lines.length === 0) {
      alert("Please fill all fields")
      return
    }
    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { "Content-Type": "application/json", Authorization: `Token ${token}` }

      // A. Header
      const res = await fetch("http://127.0.0.1:8000/api/deliveries/", {
        method: "POST", headers,
        body: JSON.stringify({ customer, warehouse, status: "draft" })
      })
      if (!res.ok) throw new Error("Failed header")
      const delivery = await res.json()

      // B. Items
      for (const line of lines) {
        await fetch("http://127.0.0.1:8000/api/delivery-items/", {
          method: "POST", headers,
          body: JSON.stringify({ delivery: delivery.id, product: line.product, quantity: line.quantity })
        })
      }

      // C. Validate
      await fetch(`http://127.0.0.1:8000/api/deliveries/${delivery.id}/validate/`, {
        method: "POST", headers: { Authorization: `Token ${token}` }
      })

      alert("Delivery Created & Validated!")
      window.location.reload()
    } catch (error) {
      alert("Network Error")
    } finally {
      setIsSaving(false)
    }
  }

  // --- 3. VIEW LOGIC ---
  const openDetails = (delivery: any) => {
    setSelectedDelivery(delivery)
    setIsViewOpen(true)
  }

  const calculateTotalQty = (items: any[]) => items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch = (d.customer?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (d.reference?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || d.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Deliveries</h1>
            <p className="text-muted-foreground mt-1">Manage outgoing shipments to customers</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Create Delivery
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Outgoing Shipments</CardTitle>
            <CardDescription>Track delivery orders and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <Input 
                  id="search" 
                  placeholder="Search by Customer..." 
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total Qty</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                  ) : filteredDeliveries.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No deliveries found.</TableCell></TableRow>
                  ) : (
                    filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-mono text-xs">DEL/{delivery.id}</TableCell>
                        <TableCell className="font-medium">{delivery.customer}</TableCell>
                        <TableCell className="text-right">{delivery.items?.length || 0}</TableCell>
                        <TableCell className="text-right">{calculateTotalQty(delivery.items)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{new Date(delivery.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                              delivery.status === "done" ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}>
                            {delivery.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDetails(delivery)}>
                            <Eye className="h-4 w-4 mr-2" /> View
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

      {/* --- VIEW DETAILS MODAL --- */}
      {isViewOpen && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-lg border border-border p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Delivery Order</h2>
                        <p className="text-sm text-muted-foreground">DEL/{selectedDelivery.id} - {selectedDelivery.customer}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsViewOpen(false)}><X className="h-4 w-4" /></Button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Status:</span>
                            <span className="ml-2 font-medium uppercase">{selectedDelivery.status}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-2 font-medium">{new Date(selectedDelivery.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">From Warehouse:</span>
                            <span className="ml-2 font-medium">{selectedDelivery.warehouse_name}</span>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedDelivery.items && selectedDelivery.items.length > 0 ? (
                                    selectedDelivery.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.product_name}</TableCell>
                                            <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No items</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                
                <div className="flex justify-end mt-6">
                    <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                </div>
            </div>
        </div>
      )}

      {/* --- CREATE MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-2xl border border-border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Delivery Order</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            
            <form onSubmit={handleCreateDelivery} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Input placeholder="e.g. Client Inc." value={customer} onChange={e => setCustomer(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>From Warehouse</Label>
                  <Select onValueChange={setWarehouse}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-md p-4 bg-muted/10">
                <div className="flex justify-between items-center mb-2">
                  <Label>Products</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addLine}><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
                </div>
                {!warehouse && lines.length > 0 && <p className="text-xs text-orange-600 mb-2">Select Warehouse first.</p>}
                <div className="space-y-2">
                  {lines.map((line, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select onValueChange={(v) => updateLine(index, 'product', v)}>
                          <SelectTrigger><SelectValue placeholder={warehouse ? "Select Product" : "Select Warehouse First"} /></SelectTrigger>
                          <SelectContent>
                            {availableProducts.length === 0 ? (
                                <SelectItem value="none" disabled>No Stock</SelectItem>
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
                        <Input type="number" placeholder="Qty" value={line.quantity} onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value))} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => setLines(lines.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-primary">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Create & Validate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}