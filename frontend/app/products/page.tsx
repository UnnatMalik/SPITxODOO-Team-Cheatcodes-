"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, X, Save, Search, Loader2, Tags, Trash2 } from "lucide-react"

export default function ProductsPage() {
  const router = useRouter()
  
  // --- STATE ---
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Forms
  const [newCategoryName, setNewCategoryName] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    low_stock_threshold: "10"
  })

  // --- 1. DATA FETCHING ---
  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) { router.push("/"); return; }
      const headers = { Authorization: `Token ${token}` }

      const [stockRes, catRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/stock/", { headers }),
        fetch("http://127.0.0.1:8000/api/categories/", { headers })
      ])

      if (stockRes.ok) setProducts(await stockRes.json())
      if (catRes.ok) setCategories(await catRes.json())

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [router])

  // --- 2. CREATE PRODUCT ---
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://127.0.0.1:8000/api/products/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert("Product Created!")
        setIsProductModalOpen(false)
        setFormData({ name: "", sku: "", category: "", unit: "", low_stock_threshold: "10" })
        fetchAllData() // Refresh data
      } else {
        alert("Failed to create product")
      }
    } catch (error) {
      alert("Network Error")
    } finally {
      setIsSaving(false)
    }
  }

  // --- 3. CREATE CATEGORY ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://127.0.0.1:8000/api/categories/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify({ name: newCategoryName })
      })

      if (response.ok) {
        setNewCategoryName("") // Clear input
        fetchAllData() // Refresh list immediately
      } else {
        alert("Failed to create category")
      }
    } catch (error) {
      alert("Network Error")
    }
  }

  // --- 4. FILTERS ---
  const filteredProducts = products.filter((p) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (p.product_name?.toLowerCase() || "").includes(searchLower) ||
      (p.sku?.toLowerCase() || "").includes(searchLower) ||
      (p.warehouse_name?.toLowerCase() || "").includes(searchLower)
    )
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">Manage inventory items and stock levels</p>
          </div>
          <div className="flex gap-3">
            {/* CATEGORY MANAGER BUTTON */}
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
                <Tags className="mr-2 h-4 w-4" /> Categories
            </Button>
            {/* ADD PRODUCT BUTTON */}
            <Button onClick={() => setIsProductModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Inventory List</CardTitle>
            <CardDescription>Real-time stock across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by Name, SKU or Location..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    {/* NEW COLUMN */}
                    <TableHead>Category</TableHead> 
                    <TableHead>Location</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No products found.</TableCell></TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.product_name}</TableCell>
                        {/* If your Stock API doesn't return category_name yet, it might be empty until we update serializer. 
                            For now, it relies on product.category_name being available or joined. */}
                        <TableCell className="text-muted-foreground">{product.category_name || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{product.warehouse_name}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                              product.quantity <= 0 ? "bg-red-100 text-red-700 border-red-200" : 
                              product.is_low_stock ? "bg-orange-100 text-orange-700 border-orange-200" : 
                              "bg-green-100 text-green-700 border-green-200"
                          }`}>
                            {product.quantity <= 0 ? "Out of Stock" : product.is_low_stock ? "Low Stock" : "In Stock"}
                          </span>
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

      {/* --- MODAL: CATEGORY MANAGER --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-md border border-border p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Manage Categories</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsCategoryModalOpen(false)}><X className="h-4 w-4" /></Button>
                </div>
                
                {/* Create New Category */}
                <form onSubmit={handleCreateCategory} className="flex gap-2 mb-6">
                    <Input 
                        placeholder="New Category Name" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                    />
                    <Button type="submit" size="sm"><Plus className="h-4 w-4" /></Button>
                </form>

                {/* List Existing */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Existing Categories</Label>
                    {categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No categories yet.</p>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                                <span className="text-sm font-medium">{cat.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL: CREATE PRODUCT --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-lg border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Product</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsProductModalOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Copper Wire" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="CW-001" />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="kg, pcs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Low Stock Alert</Label>
                  <Input type="number" value={formData.low_stock_threshold} onChange={e => setFormData({...formData, low_stock_threshold: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}