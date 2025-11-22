"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut, User, Settings } from "lucide-react"
import Image from "next/image"

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", section: "main" },
  { href: "/products", label: "Products", icon: "📦", section: "main" },
  { href: "/receipts", label: "Receipts", icon: "📥", section: "operations", badge: "3" },
  { href: "/deliveries", label: "Deliveries", icon: "📤", section: "operations", badge: "2" },
  { href: "/transfers", label: "Transfers", icon: "🔄", section: "operations" },
  { href: "/adjustments", label: "Adjustments", icon: "⚙️", section: "inventory" },
  { href: "/history", label: "Move History", icon: "📜", section: "inventory" },
  { href: "/settings", label: "Settings", icon: "⚡", section: "system" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    router.push("/")
  }

  const sections = {
    main: navigationItems.filter((item) => item.section === "main"),
    operations: navigationItems.filter((item) => item.section === "operations"),
    inventory: navigationItems.filter((item) => item.section === "inventory"),
    system: navigationItems.filter((item) => item.section === "system"),
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center justify-center hover:opacity-80 transition">
          <Image src="/quicktrace-logo.png" alt="QuickTrace" width={120} height={120} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {sections.main.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 transition-all ${
                  pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>

        {/* Operations Section */}
        <div>
          <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-2">
            Operations
          </p>
          <div className="space-y-1">
            {sections.operations.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 transition-all ${
                    pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Inventory Management Section */}
        <div>
          <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-2">
            Inventory
          </p>
          <div className="space-y-1">
            {sections.inventory.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 transition-all ${
                    pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* System Section */}
        <div>
          <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-2">System</p>
          <div className="space-y-1">
            {sections.system.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 transition-all ${
                    pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Profile Menu */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm flex-shrink-0">
                  JD
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">John Doe</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">Inventory Mgr</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
