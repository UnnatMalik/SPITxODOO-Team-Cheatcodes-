import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, Zap, Shield, Package, TrendingUp, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Enhanced logo styling for better visibility and alignment */}
            <Image
              src="/quicktrace-logo.png"
              alt="QuickTrace"
              width={160}
              height={160}
              priority
            />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition">
              Features
            </a>
            <a href="#benefits" className="text-foreground/80 hover:text-foreground transition">
              Benefits
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-foreground transition">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="outline" className="border-border hover:bg-secondary bg-transparent">
                Login
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary border border-border">
              <span className="text-sm font-medium text-foreground">New: Real-time inventory tracking</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance">
              Complete inventory management made simple
            </h1>
            <p className="text-lg text-foreground/70 max-w-md text-balance">
              Replace manual registers and Excel sheets with a centralized, real-time inventory system that scales with
              your business.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-base py-6 px-6">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" className="border-border hover:bg-secondary text-base py-6 px-6 bg-transparent">
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-6 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground">10,000+</p>
                <p className="text-sm text-foreground/60">Warehouses using QuickTrace</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">99.9%</p>
                <p className="text-sm text-foreground/60">Uptime guarantee</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-border p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-24 h-24 text-primary mx-auto mb-4 opacity-50" />
                <p className="text-foreground/60">Real-time Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Section */}
      <section className="bg-secondary/50 border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { metric: "85%", label: "Faster operations" },
              { metric: "60%", label: "Cost reduction" },
              { metric: "99%", label: "Accuracy rate" },
              { metric: "24/7", label: "Support available" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.metric}</p>
                <p className="text-sm text-foreground/60 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful features for complete control
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Designed for warehouse teams and inventory managers to streamline all stock operations in one platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Package,
              title: "Product Management",
              description:
                "Create and manage products with SKU codes, categories, and real-time stock availability across all locations.",
            },
            {
              icon: Zap,
              title: "Real-time Operations",
              description:
                "Handle receipts, deliveries, and internal transfers with automatic stock updates and validation.",
            },
            {
              icon: BarChart3,
              title: "Advanced Analytics",
              description:
                "Track KPIs, monitor low stock items, and visualize inventory trends with comprehensive dashboards.",
            },
            {
              icon: TrendingUp,
              title: "Inventory Adjustments",
              description:
                "Reconcile physical counts with recorded stock and maintain complete audit trails of all changes.",
            },
            {
              icon: Shield,
              title: "Multi-Warehouse Support",
              description: "Manage inventory across multiple locations and coordinate transfers seamlessly.",
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description:
                "Enable warehouse staff and inventory managers to work together with role-based access control.",
            },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
              <feature.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-foreground/70 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-secondary/30 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Why choose QuickTrace?</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: "Eliminate Manual Work",
                items: [
                  "Automate stock updates and validation",
                  "Replace Excel sheets with real-time data",
                  "Reduce data entry errors by 99%",
                ],
              },
              {
                title: "Improve Efficiency",
                items: [
                  "Faster picking and packing workflows",
                  "Streamlined warehouse operations",
                  "Reduced inventory discrepancies",
                ],
              },
              {
                title: "Better Decision Making",
                items: [
                  "Real-time visibility into stock levels",
                  "Predictive low-stock alerts",
                  "Detailed movement history and audit logs",
                ],
              },
              {
                title: "Scalable Solution",
                items: [
                  "Multi-warehouse support",
                  "Unlimited products and locations",
                  "Growing team collaboration features",
                ],
              },
            ].map((benefit, i) => (
              <div key={i} className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {benefit.title}
                </h3>
                <ul className="space-y-2">
                  {benefit.items.map((item, j) => (
                    <li key={j} className="text-foreground/70 flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Ready to transform your inventory management?
        </h2>
        <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
          Join thousands of businesses simplifying their warehouse operations. Start your free trial today.
        </p>
        <Link href="/auth">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-base py-6 px-8">
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                {/* Enhanced logo styling in footer for consistency */}
                <Image
                  src="/quicktrace-logo.png"
                  alt="QuickTrace"
                  width={120}
                  height={120}
                  priority
                />
              </div>
              <p className="text-sm text-foreground/60">Professional inventory management for modern warehouses</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Security", "Roadmap"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Cookies", "Compliance"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-foreground/60">© 2025 QuickTrace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
