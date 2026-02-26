"use client";

import Link from "next/link";
import {
  UtensilsCrossed,
  LayoutDashboard,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">
            RestroHub
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-accent/50 px-4 py-1.5 text-sm text-accent-foreground">
            <UtensilsCrossed className="h-4 w-4" />
            Restaurant Management System
          </div>
          <h1 className="font-display text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Manage your restaurant with ease
          </h1>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            A complete solution for managing your restaurant operations. Handle
            orders, tables, menus, and business hours all in one place.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/admin">
              <Button size="lg" className="gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Admin Panel
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/menu">
              <Button size="lg" variant="outline" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                Customer Menu
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Table Management",
              description:
                "Add, configure, and manage restaurant tables with ease.",
            },
            {
              title: "Menu Builder",
              description:
                "Create categories, subcategories, and manage products dynamically.",
            },
            {
              title: "Order Tracking",
              description:
                "Track orders from pending to served in real time.",
            },
            {
              title: "Business Hours",
              description:
                "Define and update operating hours for every day of the week.",
            },
            {
              title: "Dark Mode",
              description:
                "Full dark mode support for comfortable viewing any time.",
            },
            {
              title: "Responsive Design",
              description:
                "Works perfectly on mobile, tablet, and desktop devices.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 text-card-foreground transition-colors hover:bg-accent/30"
            >
              <h3 className="font-display font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        RestroHub - Restaurant Management System
      </footer>
    </div>
  );
}
