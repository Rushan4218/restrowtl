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
import type { MeasuringUnit } from "@/types";
import { getMeasuringUnits, createMeasuringUnit, updateMeasuringUnit, deleteMeasuringUnit } from "@/services/measuringUnitService";

export function MeasuringUnitsContent() {
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<MeasuringUnit[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MeasuringUnit | null>(null);
  const [form, setForm] = useState({ name: "", shortName: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMeasuringUnits();
      setUnits(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setForm({ name: "", shortName: "", description: "" });
    setEditing(null);
  };

  const openCreate = () => { reset(); setOpen(true); };
  const openEdit = (u: MeasuringUnit) => {
    setEditing(u);
    setForm({ name: u.name, shortName: u.shortName, description: u.description ?? "" });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (!form.name.trim()) return toast.error("Name required");
      if (!form.shortName.trim()) return toast.error("Short name required");
      if (editing) {
        await updateMeasuringUnit(editing.id, { ...form, name: form.name.trim(), shortName: form.shortName.trim() });
        toast.success("Updated");
      } else {
        await createMeasuringUnit({ ...form, name: form.name.trim(), shortName: form.shortName.trim() });
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
      await deleteMeasuringUnit(id);
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
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Add Unit</Button>
      </div>

      {!units.length ? (
        <EmptyState title="No measuring units" description="Create units like kilogram (kg), liter (ltr), pieces (pcs)." actionLabel="Add Unit" onAction={openCreate} />
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Measuring Units</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Short</th>
                    <th className="py-2 pr-3">Description</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u)=>(
                    <tr key={u.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-3 font-medium">{u.name}</td>
                      <td className="py-2 pr-3">{u.shortName}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{u.description ?? "—"}</td>
                      <td className="py-2 pr-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={()=>openEdit(u)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={()=>remove(u.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-600" /></Button>
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

      <Modal open={open} onOpenChange={(o)=>{setOpen(o); if(!o) reset();}} title={editing ? "Edit Unit" : "Add Unit"} description="Units can be assigned to stock items (multi-select).">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e)=>setForm(p=>({...p, name:e.target.value}))} placeholder="Kilogram" />
          </div>
          <div>
            <Label>Short Name</Label>
            <Input value={form.shortName} onChange={(e)=>setForm(p=>({...p, shortName:e.target.value}))} placeholder="kg" />
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
