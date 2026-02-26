"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import type { StockGroup } from "@/types";
import { getStockGroups, createStockGroup, updateStockGroup, deleteStockGroup } from "@/services/stockGroupService";

export function StockGroupsContent() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<StockGroup[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StockGroup | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(await getStockGroups());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reset = () => { setForm({ name: "", description: "" }); setEditing(null); };
  const openCreate = () => { reset(); setOpen(true); };
  const openEdit = (g: StockGroup) => { setEditing(g); setForm({ name: g.name, description: g.description ?? "" }); setOpen(true); };

  const save = async () => {
    try {
      if (!form.name.trim()) return toast.error("Name required");
      if (editing) {
        await updateStockGroup(editing.id, { name: form.name.trim(), description: form.description });
        toast.success("Updated");
      } else {
        await createStockGroup({ name: form.name.trim(), description: form.description });
        toast.success("Created");
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteStockGroup(id);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  if (loading) return <LoadingCards />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Add Group</Button>
      </div>

      {!groups.length ? (
        <EmptyState title="No stock groups" description="Create groups like Drinks, Groceries, Meat, Vegetables, Others." actionLabel="Add Group" onAction={openCreate} />
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Stock Groups</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Description</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g)=>(
                    <tr key={g.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-3 font-medium">{g.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{g.description ?? "—"}</td>
                      <td className="py-2 pr-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={()=>openEdit(g)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={()=>remove(g.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={open} onOpenChange={(o)=>{setOpen(o); if(!o) reset();}} title={editing ? "Edit Group" : "Add Group"} description="Groups help organize inventory and power analytics charts.">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e)=>setForm(p=>({...p, name:e.target.value}))} placeholder="Drinks" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e)=>setForm(p=>({...p, description:e.target.value}))} placeholder="Optional" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
