"use client";

// Admin sidebar navigation with collapsible menu
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Clock,
  Grid3X3,
  ChefHat,
  ClipboardList,
  Settings,
  ChevronLeft,
  Menu,
  UserPlus,
  Bell,
  ChevronDown,
  Utensils,
  Boxes,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const navStructure: (NavGroup | NavItem)[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hours", label: "Business Hours", icon: Clock },
  { href: "/admin/tables", label: "Tables", icon: Grid3X3 },
  {
  label: "Orders",
  icon: ClipboardList,
  items: [
    { href: "/admin/orders", label: "Time Table" },
    { href: "/admin/orders/list", label: "Order List" },
  ],
} as NavGroup,
  { href: "/admin/bell", label: "Bell Requests", icon: Bell },

  // Menu Group - Collapsible with Dishes, Category, Add-Ons, and Combos
  {
    label: "Menu",
    icon: ChefHat,
    items: [
      { href: "/admin/menu/dishes", label: "Dishes" },
      { href: "/admin/menu/categories", label: "Category" },
      { href: "/admin/menu/addons", label: "Ad-Ons & Extras" },
      { href: "/admin/menu/combos", label: "Combo Offer" },
    ],
  } as NavGroup,

  // Services Group - Collapsible with Dine In and Delivery
  {
    label: "Services",
    icon: Utensils,
    items: [
      { href: "/admin/services/dine-in", label: "Dine In" },
      { href: "/admin/services/delivery", label: "Delivery" },
    ],
  } as NavGroup,

  // Inventory Group - Collapsible
  {
    label: "Inventory",
    icon: Boxes,
    items: [
      { href: "/admin/inventory/dashboard", label: "Dashboard" },
      { href: "/admin/inventory/stock-items", label: "Stock Item" },
      { href: "/admin/inventory/consumption", label: "Consumption" },
      { href: "/admin/inventory/suppliers", label: "Suppliers" },
      { href: "/admin/inventory/measuring-units", label: "Measuring Unit" },
      { href: "/admin/inventory/stock-groups", label: "Stock Group" },
      { href: "/admin/inventory/stock-history", label: "Stock History" },
    ],
  } as NavGroup,

  {
    label: "Customer Management",
    icon: UserPlus,
    items: [
      { href: "/admin/customer-management", label: "Customer List" },
      { href: "/admin/customer-management/attributes", label: "Attribute Management" },
      { href: "/admin/customer-management/requests", label: "Membership Requests" },
    ],
  } as NavGroup,
  { href: "/admin/theme-customization", label: "Theme Customization", icon: Palette },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isNavGroup(item: NavGroup | NavItem): item is NavGroup {
  return "items" in item;
}

function ExpandableNavGroup({
  group,
  pathname,
  onNavClick,
}: {
  group: NavGroup;
  pathname: string;
  onNavClick?: () => void;
}) {
  // Deterministic "active" check (same on first render)
  const isActive = useMemo(
    () =>
      group.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      ),
    [group.items, pathname]
  );

  // Default open when active (dropdown behavior like your image)
  const [isOpen, setIsOpen] = useState<boolean>(isActive);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="flex items-center gap-2.5">
          <group.icon className="h-4 w-4" />
          <span>{group.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div className={cn("mt-0.5 ml-3 border-l border-sidebar-border space-y-0.5 overflow-hidden", isOpen ? "block" : "hidden")}>
        {group.items.map((item) => {
          const isItemActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "group flex items-center gap-2 rounded-md px-3 py-2 pl-9 text-xs font-medium transition-colors relative",
                isItemActive
                  ? "bg-sidebar-accent/80 text-sidebar-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {isItemActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary rounded-r" />
              )}

              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  isItemActive ? "bg-sidebar-primary" : "bg-sidebar-foreground/40"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NavContent({
  pathname,
  onNavClick,
}: {
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-5">
        <UtensilsCrossed className="h-6 w-6 text-sidebar-primary" />
        <span className="font-display text-lg font-bold text-sidebar-foreground">
          RestroHub
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navStructure.map((item, index) => {
          if (isNavGroup(item)) {
            return (
              <ExpandableNavGroup
                key={`${item.label}-${index}`}
                group={item}
                pathname={pathname}
                onNavClick={onNavClick}
              />
            );
          }

          const isActiveRoute =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActiveRoute
                  ? "bg-sidebar-accent/80 text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              {item.icon ? <item.icon className="h-4 w-4" /> : null}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between px-3 gap-2">
          <ThemeToggle />
          <Link href="/menu">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <ChevronLeft className="h-3 w-3" />
              Customer View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <div className="fixed left-0 top-0 z-40 flex h-14 w-full items-center gap-3 border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" type="button">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Access admin dashboard sections and settings
            </SheetDescription>
            <NavContent pathname={pathname} onNavClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <span className="font-display text-sm font-bold">RestroHub</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-sidebar-border md:block">
        <NavContent pathname={pathname} />
      </aside>
    </>
  );
}
