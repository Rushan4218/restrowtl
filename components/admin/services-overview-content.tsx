"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Truck, Clock } from "lucide-react";

export function ServicesOverviewContent() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Dine In */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-foreground">Dine In Service</CardTitle>
          <Home className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Active
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Prep Time</p>
            <p className="text-lg font-semibold text-foreground">15-20 minutes</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Available Tables</p>
            <p className="text-lg font-semibold text-foreground">All tables</p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-foreground">Delivery Service</CardTitle>
          <Truck className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Active
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Delivery Radius</p>
            <p className="text-lg font-semibold text-foreground">5 km</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Delivery Fee</p>
            <p className="text-lg font-semibold text-foreground">$3.00</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
