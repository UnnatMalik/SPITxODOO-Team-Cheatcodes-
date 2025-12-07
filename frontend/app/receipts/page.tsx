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
import { Plus, Loader2, Eye, X, Save, Trash2 } from "lucide-react"

export default function ReceiptsPage() {
  const router = useRouter()
  
  // --- STATE ---
  const [receipts, setReceipts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Create Form State
  const [supplier, setSupplier] = useState("")
  const [warehouse, setWarehouse] = useState("")
  const [lines, setLines] = useState<{product: string, quantity: number}[]>([])

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) { router.push("/"); return; }
        const headers = { Authorization: `Token ${token}` }

        // Fetch Receipts (Includes items nested!)
        const recRes = await fetch("http://127.0.0.1:8000/api/receipts/", { headers })
        if (recRes.ok) setReceipts(await recRes.json())

        // Fetch Master Data for Create Form
        const whRes = await fetch("http://127.0.0.1:8000/api/warehouses/", { headers })
        if (whRes.ok) setWarehouses(await whRes.json())

        const prodRes = await fetch("http://127.0.0.1:8000/api/products/", { headers })
        if (prodRes.ok) setProducts(await prodRes.json())

      } catch (error) {
        console.error("Error fetching data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  // --- 2. CREATE LOGIC ---
  const addLine = () => setLines([...lines, { product: "", quantity: 1 }])
  
  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplier || !warehouse || lines.length === 0) {
        alert("Please fill all fields")
        return
    }
    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { "Content-Type": "application/json", Authorization: `Token ${token}` }

      // 1. Header
      const res = await fetch("http://127.0.0.1:8000/api/receipts/", {
        method: "POST", headers,
        body: JSON.stringify({ supplier, warehouse, status: "draft" })
      })
      if (!res.ok) throw new Error("Failed header")
      const newReceipt = await res.json()

      // 2. Items
      for (const line of lines) {
        await fetch("http://127.0.0.1:8000/api/receipt-items/", {
          method: "POST", headers,
          body: JSON.stringify({ receipt: newReceipt.id, product: line.product, quantity: line.quantity })
        })
      }

      // 3. Validate (Auto)
      await fetch(`http://127.0.0.1:8000/api/receipts/${newReceipt.id}/validate/`, {
          method: "POST", headers: { Authorization: `Token ${token}` }
      })

      alert("Receipt Created & Validated!")
      window.location.reload()
    } catch (err) {
      alert("Error creating receipt")
    } finally {
      setIsSaving(false)
    }
  }

  // --- 3. VIEW DETAILS LOGIC ---
  const openDetails = (receipt: any) => {
    setSelectedReceipt(receipt)
    setIsViewOpen(true)
  }

  const calculateTotalQty = (items: any[]) => items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const filteredReceipts = receipts.filter(r => {
    const matchSearch = r.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || r.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Receipts</h1>
            <p className="text-muted-foreground mt-1">Manage incoming stock from vendors</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Receive Goods
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Incoming Shipments</CardTitle>
            <CardDescription>Track and validate vendor deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <Input 
                  id="search" 
                  placeholder="Search by Supplier..." 
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
                    <TableHead>Supplier</TableHead>
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
                  ) : filteredReceipts.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No receipts found.</TableCell></TableRow>
                  ) : (
                    filteredReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-mono text-xs">REC/{receipt.id}</TableCell>
                        <TableCell className="font-medium">{receipt.supplier}</TableCell>
                        <TableCell className="text-right">{receipt.items?.length || 0}</TableCell>
                        <TableCell className="text-right">{calculateTotalQty(receipt.items)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{new Date(receipt.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            receipt.status === 'done' ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"
                          }`}>
                            {receipt.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDetails(receipt)}>
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
      {isViewOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-lg border border-border p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Receipt Details</h2>
                        <p className="text-sm text-muted-foreground">REC/{selectedReceipt.id} - {selectedReceipt.supplier}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsViewOpen(false)}><X className="h-4 w-4" /></Button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Status:</span>
                            <span className="ml-2 font-medium uppercase">{selectedReceipt.status}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-2 font-medium">{new Date(selectedReceipt.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Warehouse:</span>
                            <span className="ml-2 font-medium">{selectedReceipt.warehouse_name}</span>
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
                                {selectedReceipt.items && selectedReceipt.items.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.product_name}</TableCell>
                                        <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
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
              <h2 className="text-xl font-bold">New Receipt</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Input placeholder="e.g. Acme Corp" value={supplier} onChange={e => setSupplier(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Destination Warehouse</Label>
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
                <div className="space-y-2">
                  {lines.map((line, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select onValueChange={(v) => updateLine(index, 'product', v)}>
                          <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                          <SelectContent>
                            {products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
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