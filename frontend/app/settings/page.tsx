"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Loader2, Save, X } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  
  // --- STATE ---
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form State
  const [whName, setWhName] = useState("")
  const [whLocation, setWhLocation] = useState("")

  // --- 1. FETCH DATA ---
  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) { router.push("/"); return; }
      
      const response = await fetch("http://127.0.0.1:8000/api/warehouses/", {
        headers: { Authorization: `Token ${token}` },
      })

      if (response.ok) {
        setWarehouses(await response.json())
      }
    } catch (error) {
      console.error("Error fetching warehouses", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [router])

  // --- 2. CREATE WAREHOUSE ---
  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://127.0.0.1:8000/api/warehouses/", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Token ${token}` 
        },
        body: JSON.stringify({ name: whName, location: whLocation })
      })

      if (response.ok) {
        alert("Warehouse Created Successfully!")
        setIsModalOpen(false)
        setWhName("")
        setWhLocation("")
        fetchWarehouses() // Refresh list
      } else {
        alert("Failed to create warehouse")
      }
    } catch (error) {
      alert("Network Error")
    } finally {
      setIsSaving(false)
    }
  }

  // --- 3. MOCK SAVE SETTINGS ---
  const handleSaveSettings = () => {
    // In a real app, this would POST to a /api/settings/ endpoint
    // For the hackathon, we simulate a success to show the UI works.
    alert("System Settings Saved Successfully!")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure warehouses and system preferences</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Warehouse Management */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Warehouse Locations</CardTitle>
                <CardDescription>Manage physical storage locations</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Warehouse
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                    ) : warehouses.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No warehouses found.</TableCell></TableRow>
                    ) : (
                        warehouses.map((wh) => (
                        <TableRow key={wh.id}>
                            <TableCell className="font-mono text-xs">WH-{wh.id}</TableCell>
                            <TableCell className="font-medium">{wh.name}</TableCell>
                            <TableCell className="text-muted-foreground">{wh.location || "N/A"}</TableCell>
                            <TableCell>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">Active</span>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* System Settings (Mock) */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>General application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Low Stock Alert Threshold</Label>
                  <Input type="number" placeholder="Default: 10" />
                  <p className="text-xs text-muted-foreground">Global default for new products</p>
                </div>
                <div className="space-y-2">
                  <Label>System Email</Label>
                  <Input type="email" placeholder="noreply@quicktrace.com" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* --- MODAL: CREATE WAREHOUSE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-md border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Warehouse</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateWarehouse} className="space-y-4">
              <div className="space-y-2">
                <Label>Warehouse Name</Label>
                <Input 
                    placeholder="e.g. North Distribution Center" 
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label>Location / Address</Label>
                <Input 
                    placeholder="e.g. Building 5, Zone A" 
                    value={whLocation}
                    onChange={(e) => setWhLocation(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-primary">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}