"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { getSubMenus, deleteSubMenu } from "@/services/subMenuService";
import type { SubMenu } from "@/types";
import { toast } from "sonner";

export function SubMenusContent() {
  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubMenus();
  }, []);

  const loadSubMenus = async () => {
    try {
      const data = await getSubMenus();
      setSubMenus(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubMenu(id);
      setSubMenus(subMenus.filter((s) => s.id !== id));
      toast.success("Sub menu deleted");
    } catch {
      toast.error("Failed to delete sub menu");
    }
  };

  if (loading) return <LoadingCards count={5} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total sub-menus: {subMenus.length}
        </p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Sub Menu
        </Button>
      </div>

      {subMenus.length === 0 ? (
        <EmptyState
          title="No sub-menus yet"
          description="Create sub-menus to organize your menu categories"
        />
      ) : (
        <div className="space-y-3">
          {subMenus.map((subMenu) => (
            <Card key={subMenu.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-foreground">{subMenu.name}</p>
                <p className="text-xs text-muted-foreground">
                  {subMenu.categoryIds.length} categories
                </p>
                {!subMenu.isActive && (
                  <Badge variant="outline" className="mt-2">Inactive</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(subMenu.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
