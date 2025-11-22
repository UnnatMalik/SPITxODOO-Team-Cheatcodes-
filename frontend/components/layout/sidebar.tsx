"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
// We keep useEffect here as a necessary React hook
import { useEffect, useState } from "react" 
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut, User, Settings } from "lucide-react" 
import Image from "next/image"

interface NavItem {
  href: string;
  label: string;
  icon: string;
  section: string;
  badge?: string;
}

// Data structure for the currently logged-in user
interface UserData {
  name: string;
  role: string;
  initials: string;
}

const navigationItems: NavItem[] = [
  // MAIN
  { href: "/dashboard", label: "Dashboard", icon: "📊", section: "Main" },
  { href: "/products", label: "Products", icon: "📦", section: "Main" },
  
  // OPERATIONS
  { href: "/receipts", label: "Receipts", icon: "📥", section: "Operations", badge: "3" }, 
  { href: "/deliveries", label: "Deliveries", icon: "📤", section: "Operations", badge: "2" }, 
  { href: "/transfers", label: "Transfers", icon: "🔄", section: "Operations" },

  // INVENTORY
  { href: "/adjustments", label: "Adjustments", icon: "⚙️", section: "Inventory" },
  { href: "/history", label: "Move History", icon: "📜", section: "Inventory" },

  // SYSTEM
  { href: "/settings", label: "Settings", icon: "⚡", section: "System" },
]

// Helper function to extract initials for the avatar
const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts.map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  // --- START: YOUR AUTH INTEGRATION ---
  
  // 1. You will need to import your actual authentication hook here, 
  //    e.g., 'import { useAuth } from "@/hooks/useAuth";'
  //    Since I don't have it, I'm setting up a temporary state to illustrate.

  // TEMPORARY: Placeholder state to simulate user data fetching
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    // --- IMPORTANT: REPLACE THE FOLLOWING LINES WITH YOUR AUTH LOGIC ---
    // Instead of this placeholder logic, you will use your real auth context.
    
    // Example using a custom hook: 
    // const { user, isAuthenticated } = useAuth();
    // if (isAuthenticated) {
    //   setCurrentUser({
    //     name: user.full_name, // e.g., fetched from your Django API
    //     role: user.job_title, // e.g., fetched from your Django API
    //     initials: getInitials(user.full_name),
    //   });
    // }
    
    // Check for token first to determine if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, check for stored user data
      const storedUser = localStorage.getItem('quicktrace_user');
      if (storedUser) {
          try {
              const user = JSON.parse(storedUser);
              setCurrentUser({
                  name: user.name || user.username || "Demo User", 
                  role: user.role || "Manager",
                  initials: getInitials(user.name || user.username || "Demo User"),
              });
          } catch (e) {
              console.error("Failed to parse user data from storage", e);
              // Set dummy user if token exists but user data is corrupted
              setCurrentUser({
                  name: "Demo User",
                  role: "Manager", 
                  initials: "DU"
              });
          }
      } else {
          // Set dummy user if token exists but no user data
          setCurrentUser({
              name: "Demo User",
              role: "Manager",
              initials: "DU"
          });
      }
    } else {
        // If no token is found (e.g., after logout or not logged in)
        setCurrentUser(null); 
    }
  }, []); // Run only once on mount to check initial state

  // --- END: YOUR AUTH INTEGRATION ---

  const sections = Array.from(new Set(navigationItems.map(item => item.section)))

  const handleLogout = () => {
    // 2. Implement your actual sign-out logic here (e.g., calling yourAuthHook.signOut())
    localStorage.removeItem("quicktrace_user") // Clear stored user data
    localStorage.removeItem("token")
    setCurrentUser(null) // Clear user state in the UI
    router.push("/")
  }

  // Group items by section
  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = []
    }
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, NavItem[]>)

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card flex flex-col p-4 shadow-lg">
      
      {/* Logo/Title */}
      <div className="flex flex-col items-center mb-6 p-2">
        <Image src="/quicktrace-logo.png" alt="QuickTrace Logo" width={180} height={180} className="rounded mb-2" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto space-y-4">
        {sections.map(section => (
          <div key={section} className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground p-2">{section}</h3>
            {groupedItems[section].map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} legacyBehavior passHref>
                  <a
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {/* Render the emoji */}
                    <span className="w-5 h-5 flex items-center justify-center text-xl leading-none">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {/* Render the badge only if it exists */}
                    {item.badge && (
                      <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-foreground text-primary dark:bg-primary/20 dark:text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User Profile / Logout - Now uses the currentUser state */}
      <div className="mt-6 pt-4 border-t border-border">
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full h-auto p-2 flex justify-between text-foreground hover:bg-muted/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* User Profile Icon with initials */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                    {currentUser.initials}
                  </div>
                  <div className="text-left min-w-0">
                    {/* Display user name */}
                    <p className="text-sm font-medium truncate">{currentUser.name}</p>
                    {/* Display user role */}
                    <p className="text-xs text-muted-foreground truncate">{currentUser.role}</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
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
        ) : (
          <div className="p-2 text-center text-sm text-muted-foreground">
            <p>Loading user...</p>
            <Button variant="link" onClick={() => router.push('/login')} className="p-0 h-auto mt-1">
                Go to Login
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}