"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import type { Product } from "@/types";

interface ProductSelectorProps {
  products: Product[];
  onSelect: (product: Product) => void;
  selectedProductIds?: string[];
}

export function ProductSelector({
  products,
  onSelect,
  selectedProductIds = [],
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background border-border"
        />
      </div>

      {/* Products List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => onSelect(product)}
              className="w-full text-left p-3 rounded-md border border-border hover:bg-muted transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm truncate">
                      {product.name}
                    </p>
                    {selectedProductIds.includes(product.id) && (
                      <Badge variant="secondary" className="text-xs">Added</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-semibold text-foreground text-sm">
                    ${product.price.toFixed(2)}
                  </span>
                  <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
