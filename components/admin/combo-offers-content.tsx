"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getAllComboOffers, deleteComboOffer } from "@/services/comboOfferService";
import type { ComboOffer } from "@/types";
import { toast } from "sonner";

export function ComboOffersContent() {
  const [combos, setCombos] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCombos();
  }, []);

  const loadCombos = async () => {
    try {
      const data = await getAllComboOffers();
      setCombos(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComboOffer(id);
      setCombos(combos.filter((c) => c.id !== id));
      toast.success("Combo offer deleted");
    } catch {
      toast.error("Failed to delete combo offer");
    }
  };

  if (loading) return <LoadingCards count={6} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total combos: {combos.length}
        </p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Combo
        </Button>
      </div>

      {combos.length === 0 ? (
        <EmptyState
          title="No combo offers yet"
          description="Create combo bundles to boost sales"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo) => {
            const savings = combo.basePrice - combo.discountPrice;
            const discountPercent = Math.round((savings / combo.basePrice) * 100);

            return (
              <Card key={combo.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{combo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {combo.quantity} items in combo
                      </p>
                    </div>
                    {!combo.isActive && (
                      <Badge variant="secondary" className="shrink-0">
                        Inactive
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Base Price:</span>
                      <span className="text-sm line-through text-muted-foreground">
                        ${combo.basePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">
                        Combo Price:
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ${combo.discountPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Save:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        {discountPercent}% off
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(combo.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
