"use client"

import { useState } from "react"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const [authTab, setAuthTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  // --- LOGIN LOGIC ---
  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.email, password: formData.password })
      })
      
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user_id', data.user_id)
        window.location.href = "/dashboard"
      } else {
        alert(data.error || "Login failed")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login Error:", error)
      alert("Backend connection failed. Ensure Django is running on port 8000.")
      setIsLoading(false)
    }
  }

  // --- SIGNUP LOGIC ---
  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.email, email: formData.email, password: formData.password })
      })
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        window.location.href = "/dashboard"
      } else {
        alert(data.error || "Signup failed")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Signup Error:", error)
      alert("Signup failed. Check console.")
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
         <div className="text-xl font-bold animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center justify-center mb-4 hover:opacity-80 transition">
            {/* Using standard img tag for compatibility */}
            <img src="/quicktrace-logo.png" alt="QuickTrace" width={120} height={120} className="w-24 h-24 object-contain" />
          </a>
          <p className="text-muted-foreground mt-2">Inventory Management System</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Manage your inventory with ease</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="user@example.com" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                </div>
                <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90">Login</Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="user@example.com" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                </div>
                <Button onClick={handleSignup} className="w-full bg-primary hover:bg-primary/90">Create Account</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}