"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getProducts } from "@/services/productService";
import type { Product } from "@/types";

export function MenuIndexContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCards count={8} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total dishes: {products.length}
        </p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Dish
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No dishes yet"
          description="Start by adding your first dish to the menu"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <p className="font-semibold text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <p className="mt-2 font-medium text-primary">${product.price}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
