"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader } from "@/components/ui/loader"
import Link from "next/link"

export default function AuthPage() {
  const router = useRouter()
  const [authTab, setAuthTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  const handleSignup = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4 hover:opacity-80 transition">
            <Image src="/quicktrace-logo.png" alt="QuickTrace" width={120} height={120} />
          </Link>
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
                  <Label htmlFor="email-login">Email</Label>
                  <Input id="email-login" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input id="password-login" type="password" placeholder="••••••••" />
                </div>
                <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90">
                  Login
                </Button>
                <button className="w-full text-sm text-accent hover:text-accent/80 text-center">
                  Forgot password?
                </button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input id="email-signup" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>
                <Button onClick={handleSignup} className="w-full bg-primary hover:bg-primary/90">
                  Create Account
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
