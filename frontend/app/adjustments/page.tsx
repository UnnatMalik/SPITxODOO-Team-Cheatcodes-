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
import { Loader2, Plus, X, Save } from "lucide-react"

export default function AdjustmentsPage() {
  const router = useRouter()
  
  // --- STATE ---
  const [adjustments, setAdjustments] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [stockList, setStockList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    warehouse: "",
    product: "",
    counted_quantity: "",
    reason: ""
  })

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) { router.push("/"); return; }
        const headers = { Authorization: `Token ${token}` }

        // Fetch Adjustments History
        const adjRes = await fetch("http://127.0.0.1:8000/api/adjustments/", { headers })
        
        if (adjRes.ok) {
            const rawData = await adjRes.json()
            
            // FIX: Deduplicate by ID to prevent double counting in UI
            // This creates a Map where keys are IDs, automatically overwriting duplicates
            const uniqueAdjustments = Array.from(
                new Map(rawData.map((item: any) => [item.id, item])).values()
            )
            // Sort by newest first
            // @ts-ignore
            uniqueAdjustments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            
            setAdjustments(uniqueAdjustments)
        }

        // Fetch Warehouses & Stock (for the create form)
        const whRes = await fetch("http://127.0.0.1:8000/api/warehouses/", { headers })
        if (whRes.ok) setWarehouses(await whRes.json())

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

  // --- 2. CREATE ADJUSTMENT LOGIC ---
  
  // Filter products available in the selected warehouse
  const availableProducts = stockList.filter(
    item => item.warehouse.toString() === formData.warehouse
  )

  // Get current system stock for the selected product (for reference)
  const selectedProductStock = availableProducts.find(
    p => p.product.toString() === formData.product
  )?.quantity || 0

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://127.0.0.1:8000/api/adjustments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        },
        body: JSON.stringify({
            warehouse: formData.warehouse,
            product: formData.product,
            counted_quantity: parseFloat(formData.counted_quantity),
            reason: formData.reason
        })
      })

      if (response.ok) {
        alert("Adjustment Applied Successfully! Stock Updated.")
        setIsModalOpen(false)
        window.location.reload() // Reload to see the new (single) entry
      } else {
        const err = await response.json()
        alert("Error: " + JSON.stringify(err))
      }
    } catch (error) {
      alert("Network Error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock Adjustments</h1>
            <p className="text-muted-foreground mt-1">Correct inventory discrepancies</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> New Adjustment
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Adjustment History</CardTitle>
            <CardDescription>Log of all manual stock corrections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Counted Qty</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                  ) : adjustments.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No adjustments recorded.</TableCell></TableRow>
                  ) : (
                    adjustments.map((adj) => (
                      <TableRow key={adj.id}>
                        <TableCell className="font-mono text-xs">ADJ/{adj.id}</TableCell>
                        <TableCell className="font-medium">{adj.product_name}</TableCell>
                        <TableCell className="text-muted-foreground">{adj.warehouse_name}</TableCell>
                        <TableCell className="text-right font-bold">{adj.counted_quantity}</TableCell>
                        <TableCell className="text-muted-foreground">{adj.reason || "-"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(adj.created_at).toLocaleDateString()}
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

      {/* --- MODAL: CREATE ADJUSTMENT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-md border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Inventory Adjustment</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select onValueChange={(v) => setFormData({...formData, warehouse: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product</Label>
                <Select onValueChange={(v) => setFormData({...formData, product: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                  <SelectContent>
                    {availableProducts.length === 0 ? (
                        <SelectItem value="none" disabled>Select Warehouse First</SelectItem>
                    ) : (
                        availableProducts.map(item => (
                            <SelectItem key={item.id} value={item.product.toString()}>
                                {item.product_name} (System: {item.quantity})
                            </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Actual Count (Physical)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 8" 
                  value={formData.counted_quantity}
                  onChange={e => setFormData({...formData, counted_quantity: e.target.value})}
                  required
                />
                {formData.product && (
                    <p className="text-xs text-muted-foreground">
                        System thinks you have: <strong>{selectedProductStock}</strong>. 
                        Adjustment will be: <strong>{parseFloat(formData.counted_quantity || "0") - selectedProductStock}</strong>
                    </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Input 
                  placeholder="e.g. Damaged, Lost, Found extra" 
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
                  Apply Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}