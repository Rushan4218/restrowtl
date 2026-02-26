import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/admin/inventory/dashboard", title: "Inventory Dashboard", desc: "KPIs, trends, and charts" },
  { href: "/admin/inventory/stock-items", title: "Stock Items", desc: "Create items, restock, and view valuations" },
  { href: "/admin/inventory/consumption", title: "Consumption", desc: "Consume stock via dishes and recipes" },
  { href: "/admin/inventory/suppliers", title: "Suppliers", desc: "Supplier ledger, to-pay / to-receive balances" },
  { href: "/admin/inventory/measuring-units", title: "Measuring Units", desc: "Units like kg, ltr, pcs" },
  { href: "/admin/inventory/stock-groups", title: "Stock Groups", desc: "Drinks, groceries, meat, vegetables, others" },
  { href: "/admin/inventory/stock-history", title: "Stock History", desc: "Movements: opening, restock, consumption" },
];

export default function InventoryHomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Frontend-only inventory management with mock APIs and accounting-style calculations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{l.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{l.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
