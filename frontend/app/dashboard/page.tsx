"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts"

// Placeholder chart data (until we build history API)
const dashboardData = [
  { month: "Jan", receipts: 40, deliveries: 24 },
  { month: "Feb", receipts: 30, deliveries: 13 },
  { month: "Mar", receipts: 20, deliveries: 29 },
  { month: "Apr", receipts: 50, deliveries: 19 },
]
const stockDistribution = [
  { name: "Raw Material", value: 35 },
  { name: "Finished", value: 25 },
  { name: "Spares", value: 20 },
]
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_products: 0,
    low_stock_items: 0,
    pending_receipts: 0,
    pending_deliveries: 0,
    pending_transfers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check Auth
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = "/"
      return
    }

    // 2. Fetch Real Data
    const fetchStats = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/dashboard/stats/', {
          headers: {
            'Authorization': `Token ${token}`, // Send the badge!
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const kpis = [
    { label: "Total Products", value: stats.total_products, icon: "📦", color: "text-blue-600" },
    { label: "Low Stock Alerts", value: stats.low_stock_items, icon: "⚠️", color: "text-red-600" },
    { label: "Pending Receipts", value: stats.pending_receipts, icon: "📥", color: "text-emerald-600" },
    { label: "Pending Deliveries", value: stats.pending_deliveries, icon: "📤", color: "text-orange-600" },
    { label: "Internal Transfers", value: stats.pending_transfers, icon: "🔄", color: "text-indigo-600" },
  ]

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Dashboard...</div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, Manager</p>
          </div>
          <div className="text-sm text-gray-400">
            Live Data Connection: <span className="text-green-500 font-bold">Active</span>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                  <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
                </div>
                <div className={`text-3xl ${kpi.color}`}>{kpi.icon}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Operations Overview</CardTitle>
              <CardDescription>Inbound vs Outbound (Last 4 Months)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="receipts" name="Receipts (In)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deliveries" name="Deliveries (Out)" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Inventory Composition</CardTitle>
              <CardDescription>By Category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={stockDistribution} 
                    cx="50%" cy="50%" 
                    innerRadius={60} outerRadius={80} 
                    paddingAngle={5} dataKey="value"
                  >
                    {stockDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}