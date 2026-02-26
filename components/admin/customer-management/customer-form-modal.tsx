"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttributeMultiSelect } from "./attribute-multi-select";
import type { CustomerCreateInput, CustomerProfile, Gender } from "@/types";

const genders: Array<{ value: Gender; label: string }> = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_say", label: "Prefer not to say" },
];

export function CustomerFormModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: CustomerProfile | null;
  onSubmit: (payload: CustomerCreateInput, id?: string) => Promise<void>;
}) {
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState<CustomerCreateInput>({
    fullName: "",
    telephone: "",
    email: "",
    gender: undefined,
    birthday: "",
    homeAddress: "",
    companyName: "",
    department: "",
    jobTitle: "",
    workAddress: "",
    allergy: "",
    favoriteThings: "",
    whatIHate: "",
    remarks: "",
    attributeIds: [],
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        fullName: initial.fullName ?? "",
        telephone: initial.telephone ?? "",
        email: initial.email ?? "",
        gender: initial.gender,
        birthday: initial.birthday ?? "",
        homeAddress: initial.homeAddress ?? "",
        companyName: initial.companyName ?? "",
        department: initial.department ?? "",
        jobTitle: initial.jobTitle ?? "",
        workAddress: initial.workAddress ?? "",
        allergy: initial.allergy ?? "",
        favoriteThings: initial.favoriteThings ?? "",
        whatIHate: initial.whatIHate ?? "",
        remarks: initial.remarks ?? "",
        attributeIds: initial.attributeIds ?? [],
      });
    } else {
      setForm({
        fullName: "",
        telephone: "",
        email: "",
        gender: undefined,
        birthday: "",
        homeAddress: "",
        companyName: "",
        department: "",
        jobTitle: "",
        workAddress: "",
        allergy: "",
        favoriteThings: "",
        whatIHate: "",
        remarks: "",
        attributeIds: [],
      });
    }
  }, [open, initial]);

  const canSubmit = useMemo(() => {
    return Boolean(form.fullName.trim() && form.telephone.trim() && form.email.trim());
  }, [form.fullName, form.telephone, form.email]);

  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onSubmit(
        {
          ...form,
          fullName: form.fullName.trim(),
          telephone: form.telephone.trim(),
          email: form.email.trim(),
        },
        initial?.id
      );
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof CustomerCreateInput, val: any) =>
    setForm((p) => ({ ...p, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Customer" : "New Registration"}</DialogTitle>
          <DialogDescription>
            Save customer profile and attributes for faster order creation and better service.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Full name" />
              </div>
              <div className="space-y-1">
                <Label>
                  Telephone <span className="text-destructive">*</span>
                </Label>
                <Input value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="Phone number" />
              </div>
              <div className="space-y-1">
                <Label>
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select value={form.gender ?? ""} onValueChange={(v) => set("gender", v || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Birthday</Label>
                <Input type="date" value={form.birthday ?? ""} onChange={(e) => set("birthday", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Home Address</Label>
                <Input value={form.homeAddress ?? ""} onChange={(e) => set("homeAddress", e.target.value)} placeholder="Home address" />
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-3">
              <div className="text-sm font-semibold">Work</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Company Name</Label>
                  <Input value={form.companyName ?? ""} onChange={(e) => set("companyName", e.target.value)} placeholder="Company" />
                </div>
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Input value={form.department ?? ""} onChange={(e) => set("department", e.target.value)} placeholder="Department" />
                </div>
                <div className="space-y-1">
                  <Label>Job Title</Label>
                  <Input value={form.jobTitle ?? ""} onChange={(e) => set("jobTitle", e.target.value)} placeholder="Job title" />
                </div>
                <div className="space-y-1">
                  <Label>Work Address</Label>
                  <Input value={form.workAddress ?? ""} onChange={(e) => set("workAddress", e.target.value)} placeholder="Work address" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-3">
              <div className="text-sm font-semibold">Preferences</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Allergy</Label>
                  <Textarea value={form.allergy ?? ""} onChange={(e) => set("allergy", e.target.value)} placeholder="Allergies" className="min-h-[80px]" />
                </div>
                <div className="space-y-1">
                  <Label>Favorite Things</Label>
                  <Textarea value={form.favoriteThings ?? ""} onChange={(e) => set("favoriteThings", e.target.value)} placeholder="Favorite items / preferences" className="min-h-[80px]" />
                </div>
                <div className="space-y-1">
                  <Label>What I Hate</Label>
                  <Textarea value={form.whatIHate ?? ""} onChange={(e) => set("whatIHate", e.target.value)} placeholder="Dislikes" className="min-h-[80px]" />
                </div>
                <div className="space-y-1">
                  <Label>Remarks</Label>
                  <Textarea value={form.remarks ?? ""} onChange={(e) => set("remarks", e.target.value)} placeholder="Remarks" className="min-h-[80px]" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border p-4">
              <div className="text-sm font-semibold">Attributes</div>
              <div className="mt-3">
                <AttributeMultiSelect value={form.attributeIds} onChange={(ids) => set("attributeIds", ids)} />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={!canSubmit || saving}>
                {saving ? "Saving..." : isEdit ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
