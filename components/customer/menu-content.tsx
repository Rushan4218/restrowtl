"use client";

// Menu content component with search, category filtering, and quantity selection
import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Minus, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { getMenuFilters } from "@/services/serviceConfigService";
import { useCart } from "@/hooks/use-cart";
import type { Product, Category, MenuFilter } from "@/types";
import { cn } from "@/lib/utils";

export function MenuContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<MenuFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { setItemQuantity, getQuantity } = useCart();

  const loadData = useCallback(async () => {
    try {
      const [prods, cats, filts] = await Promise.all([
        getProducts(),
        getCategories(),
        getMenuFilters(),
      ]);
      setProducts(prods.filter((p) => p.isAvailable));
      setCategories(cats);
      setFilters(filts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rootCategories = categories.filter((c) => c.parentId === null);
  const subcategories = categories.filter((c) => c.parentId !== null);

  const getSubcategoryIds = (rootId: string) =>
    subcategories.filter((c) => c.parentId === rootId).map((c) => c.id);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    
    if (activeCategory !== "all") {
      const subIds = getSubcategoryIds(activeCategory);
      if (subIds.length > 0) {
        if (!subIds.includes(p.categoryId)) return false;
      } else if (p.categoryId !== activeCategory) {
        return false;
      }
    }
    
    return matchesSearch;
  });

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || "";

  const handleIncrement = (product: Product) => {
    const current = getQuantity(product.id);
    setItemQuantity(product, current + 1);
  };

  const handleDecrement = (product: Product) => {
    const current = getQuantity(product.id);
    if (current > 0) {
      setItemQuantity(product, current - 1);
    }
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  if (loading) return <LoadingCards count={8} />;

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search the menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setActiveCategory("all")}
        >
          All
        </Button>
        {rootCategories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={activeCategory === cat.id ? "default" : "outline"}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Menu Filters (Tags like Vegetarian, Spicy, etc.) */}
      {filters.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Filter By</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant={
                  selectedFilters.includes(filter.id) ? "default" : "outline"
                }
                className="cursor-pointer gap-1"
                onClick={() => toggleFilter(filter.id)}
              >
                {filter.icon && <span>{filter.icon}</span>}
                {filter.name}
                {selectedFilters.includes(filter.id) && (
                  <X className="h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Selected Filters Display */}
      {selectedFilters.length > 0 && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Filters applied: {selectedFilters.length}
            <button
              onClick={() => setSelectedFilters([])}
              className="ml-2 underline hover:no-underline"
            >
              Clear all
            </button>
          </p>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No items found"
          description="Try a different search or category."
          className="mt-8"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const qty = getQuantity(product.id);
            const isSelected = qty > 0;

            return (
              <Card
                key={product.id}
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isSelected
                    ? "ring-2 ring-primary shadow-lg shadow-primary/10"
                    : "hover:shadow-md"
                )}
              >
                <CardContent className="p-0">
                  {/* Product image area */}
                  <div
                    className={cn(
                      "relative h-28 overflow-hidden transition-colors duration-200 sm:h-32 lg:h-36",
                      isSelected
                        ? "ring-inset"
                        : ""
                    )}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {!product.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <span className="text-sm font-semibold text-muted-foreground">Unavailable</span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                        {qty}
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="mb-1 flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                          {product.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {getCategoryName(product.categoryId)}
                        </span>
                      </div>
                      <span className="ml-1 text-base font-bold text-primary sm:text-lg">
                        {"$"}{product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:mb-4 sm:text-sm">
                      {product.description}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
                        onClick={() => handleDecrement(product)}
                        disabled={qty === 0}
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>

                      <span
                        className={cn(
                          "w-8 text-center text-base font-bold tabular-nums sm:w-10 sm:text-lg",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {qty}
                      </span>

                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
                        onClick={() => handleIncrement(product)}
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
