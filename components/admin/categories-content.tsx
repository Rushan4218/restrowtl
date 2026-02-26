"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, FolderTree, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from "@/components/shared/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingCards } from "@/components/shared/loading-state";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categoryService";
import type { Category } from "@/types";

export function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: null as string | null,
  });

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const rootCategories = categories.filter((c) => c.parentId === null);
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  const resetForm = () => {
    setFormData({ name: "", description: "", parentId: null });
    setEditing(null);
  };

  const openCreate = (parentId: string | null = null) => {
    resetForm();
    setFormData((prev) => ({ ...prev, parentId }));
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      parentId: cat.parentId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      if (editing) {
        await updateCategory(editing.id, formData);
        toast.success("Category updated");
      } else {
        await createCategory(formData);
        toast.success("Category created");
      }
      setModalOpen(false);
      resetForm();
      await loadCategories();
    } catch {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      await loadCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  if (loading) return <LoadingCards count={4} />;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} categor{categories.length !== 1 ? "ies" : "y"}{" "}
          total
        </p>
        <Button onClick={() => openCreate()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {rootCategories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-10 w-10" />}
          title="No categories yet"
          description="Create your first category to organize your menu."
          action={
            <Button onClick={() => openCreate()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {rootCategories.map((root) => {
            const children = getChildren(root.id);
            return (
              <Card key={root.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <FolderTree className="h-4 w-4 text-primary" />
                      {root.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCreate(root.id)}
                        className="gap-1 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Sub
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(root)}
                        aria-label={`Edit ${root.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(root.id)}
                        className="text-destructive hover:text-destructive"
                        aria-label={`Delete ${root.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {root.description && (
                    <p className="text-sm text-muted-foreground">
                      {root.description}
                    </p>
                  )}
                </CardHeader>
                {children.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <span className="text-sm font-medium text-foreground">
                                {child.name}
                              </span>
                              {child.description && (
                                <p className="text-xs text-muted-foreground">
                                  {child.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(child)}
                              aria-label={`Edit ${child.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(child.id)}
                              className="text-destructive hover:text-destructive"
                              aria-label={`Delete ${child.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Category" : "Add New Category"}
        description={
          editing
            ? "Update category details."
            : "Create a new menu category."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Beverages, Appetizers"
              required
            />
          </div>
          <div>
            <Label htmlFor="cat-desc">Description</Label>
            <Input
              id="cat-desc"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description"
            />
          </div>
          <div>
            <Label>Parent Category</Label>
            <Select
              value={formData.parentId || "none"}
              onValueChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  parentId: val === "none" ? null : val,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Root Category)</SelectItem>
                {rootCategories
                  .filter((c) => c.id !== editing?.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
