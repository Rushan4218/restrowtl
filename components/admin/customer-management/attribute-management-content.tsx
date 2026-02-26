"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { adminAttributeService } from "@/services/adminAttributeService";
import type { CustomerAttribute } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import {
  AdminCard,
  AdminTableHeader,
  AdminTableCell,
  AdminTableRow,
  AdminActionButton,
  AdminEmptyState,
} from "@/components/admin/shared/admin-components";

export function AttributeManagementContent() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CustomerAttribute[]>([]);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerAttribute | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      const all = await adminAttributeService.getAttributes();
      setItems(all);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load attributes");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadAll();
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        (a.description ?? "").toLowerCase().includes(query)
    );
  }, [items, q]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setOpen(true);
  };

  const openEdit = (a: CustomerAttribute) => {
    setEditing(a);
    setName(a.name);
    setDescription(a.description ?? "");
    setOpen(true);
  };

  const canSave = Boolean(name.trim());

  const save = async () => {
    if (!canSave) return;
    try {
      if (editing) {
        await adminAttributeService.updateAttribute(editing.id, {
          name,
          description,
        });
        toast.success("Attribute updated");
      } else {
        await adminAttributeService.createAttribute({ name, description });
        toast.success("Attribute created");
      }
      setOpen(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save attribute");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this attribute?")) return;
    try {
      await adminAttributeService.deleteAttribute(id);
      toast.success("Attribute deleted");
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete attribute");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <AdminCard>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name / description"
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <Button onClick={openCreate} className="w-full lg:w-auto gap-2">
            <Plus className="h-4 w-4" />
            New Attribute
          </Button>
        </div>
      </AdminCard>

      {/* Attributes Table */}
      {loading ? (
        <AdminCard className="text-center py-8">
          <p className="text-muted-foreground">Loading attributes...</p>
        </AdminCard>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title="No attributes found"
          description="Create your first attribute to get started."
          action={<Button onClick={openCreate}>Create Attribute</Button>}
        />
      ) : (
        <AdminCard className="p-0 overflow-hidden border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <AdminTableHeader columns={["Name", "Description", "Actions"]} />
              <tbody>
                {filtered.map((a) => (
                  <AdminTableRow key={a.id}>
                    <AdminTableCell>
                      <div className="font-medium text-card-foreground">{a.name}</div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {a.description ?? "-"}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <AdminActionButton
                          variant="ghost"
                          onClick={() => openEdit(a)}
                          title="Edit attribute"
                          className="text-primary hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </AdminActionButton>
                        <AdminActionButton
                          variant="ghost"
                          onClick={() => remove(a.id)}
                          title="Delete attribute"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </AdminActionButton>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{editing ? "Edit Attribute" : "Create Attribute"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Attributes are used in customer profiles and filters (VIP, Smoking, Owner's Friend, etc.).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Attribute name"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground">Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Optional description" 
                className="min-h-[90px] bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={!canSave}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
