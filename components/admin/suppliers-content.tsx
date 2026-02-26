"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Receipt, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Supplier, SupplierTransaction, SupplierTxnType } from "@/types";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplierTransactions, createSupplierTransaction } from "@/services/supplierService";
import { supplierNetBalance, supplierToPayToReceive, supplierOpeningNet } from "@/lib/inventory/calculations";

export function SuppliersContent() {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [txns, setTxns] = useState<SupplierTransaction[]>([]);

  const [openSupplier, setOpenSupplier] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    legalOrgName: "",
    phone: "",
    email: "",
    taxNumber: "",
    dob: "",
    openingBalanceType: "to_pay" as "to_collect" | "to_pay",
    openingAmount: 0,
  });

  const [openTxn, setOpenTxn] = useState(false);
  const [txnForm, setTxnForm] = useState({
    supplierId: "",
    type: "purchase" as SupplierTxnType,
    amount: 0,
    reference: "",
    note: "",
    date: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([getSuppliers(), getSupplierTransactions()]);
      setSuppliers(s);
      setTxns(t);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => {
    const nets = suppliers.map((s) => supplierNetBalance(s, txns));
    const toPay = nets.reduce((sum, n) => sum + supplierToPayToReceive(n).toPay, 0);
    const toReceive = nets.reduce((sum, n) => sum + supplierToPayToReceive(n).toReceive, 0);
    return { toPay, toReceive, net: toPay - toReceive };
  }, [suppliers, txns]);

  const resetSupplierForm = () => {
    setForm({
      fullName: "",
      legalOrgName: "",
      phone: "",
      email: "",
      taxNumber: "",
      dob: "",
      openingBalanceType: "to_pay",
      openingAmount: 0,
    });
    setEditing(null);
  };

  const openCreate = () => { resetSupplierForm(); setOpenSupplier(true); };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      fullName: s.fullName,
      legalOrgName: s.legalOrgName ?? "",
      phone: s.phone,
      email: s.email ?? "",
      taxNumber: s.taxNumber ?? "",
      dob: s.dob ?? "",
      openingBalanceType: s.openingBalanceType,
      openingAmount: s.openingAmount,
    });
    setOpenSupplier(true);
  };

  const saveSupplier = async () => {
    try {
      if (!form.fullName.trim()) return toast.error("Full name required");
      if (!form.phone.trim()) return toast.error("Phone required");
      if (editing) {
        await updateSupplier(editing.id, { ...form, fullName: form.fullName.trim(), phone: form.phone.trim() });
        toast.success("Supplier updated");
      } else {
        await createSupplier({ ...form, fullName: form.fullName.trim(), phone: form.phone.trim() });
        toast.success("Supplier created");
      }
      setOpenSupplier(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const removeSupplier = async (id: string) => {
    try {
      await deleteSupplier(id);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  const openAddTxn = (supplierId?: string) => {
    setTxnForm({
      supplierId: supplierId ?? "",
      type: "purchase",
      amount: 0,
      reference: "",
      note: "",
      date: "",
    });
    setOpenTxn(true);
  };

  const saveTxn = async () => {
    try {
      if (!txnForm.supplierId) return toast.error("Select supplier");
      if (txnForm.amount <= 0) return toast.error("Amount must be > 0");
      await createSupplierTransaction({
        supplierId: txnForm.supplierId,
        type: txnForm.type,
        amount: Number(txnForm.amount),
        reference: txnForm.reference || undefined,
        note: txnForm.note || undefined,
        date: txnForm.date ? new Date(txnForm.date).toISOString() : new Date().toISOString(),
      });
      toast.success("Transaction added");
      setOpenTxn(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  if (loading) return <LoadingCards />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Pay</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.toPay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total outstanding payable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Receive</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.toReceive.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Net receivable from suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.net.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">To pay minus to receive</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => openAddTxn()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {!suppliers.length ? (
        <EmptyState title="No suppliers yet" description="Add suppliers to track payables/receivables with ledger-style calculations." actionLabel="Add Supplier" onAction={openCreate} />
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Suppliers</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-3">Supplier</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Opening</th>
                    <th className="py-2 pr-3">To Pay</th>
                    <th className="py-2 pr-3">To Receive</th>
                    <th className="py-2 pr-3">Net</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => {
                    const net = supplierNetBalance(s, txns);
                    const { toPay, toReceive } = supplierToPayToReceive(net);
                    const openNet = supplierOpeningNet(s);
                    return (
                      <tr key={s.id} className="border-b last:border-b-0">
                        <td className="py-2 pr-3">
                          <div className="font-medium">{s.fullName}</div>
                          <div className="text-xs text-muted-foreground">{s.legalOrgName ?? "—"}</div>
                        </td>
                        <td className="py-2 pr-3">{s.phone}</td>
                        <td className="py-2 pr-3">{openNet.toFixed(2)}</td>
                        <td className="py-2 pr-3">{toPay.toFixed(2)}</td>
                        <td className="py-2 pr-3">{toReceive.toFixed(2)}</td>
                        <td className="py-2 pr-3 font-medium">{net.toFixed(2)}</td>
                        <td className="py-2 pr-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openAddTxn(s.id)}>
                              Add Txn
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => removeSupplier(s.id)} aria-label="Delete">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <div className="mb-2 font-medium">Recent Supplier Transactions</div>
              {!txns.length ? (
                <div className="text-sm text-muted-foreground">No transactions yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr className="border-b">
                        <th className="py-2 pr-3">Date</th>
                        <th className="py-2 pr-3">Supplier</th>
                        <th className="py-2 pr-3">Type</th>
                        <th className="py-2 pr-3">Amount</th>
                        <th className="py-2 pr-3">Reference</th>
                        <th className="py-2 pr-3">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txns.slice(0, 12).map((t) => (
                        <tr key={t.id} className="border-b last:border-b-0">
                          <td className="py-2 pr-3">{t.date.slice(0, 10)}</td>
                          <td className="py-2 pr-3">{suppliers.find(s => s.id === t.supplierId)?.fullName ?? "—"}</td>
                          <td className="py-2 pr-3">{t.type}</td>
                          <td className="py-2 pr-3">{t.amount.toFixed(2)}</td>
                          <td className="py-2 pr-3">{t.reference ?? "—"}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{t.note ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        open={openSupplier}
        onOpenChange={(o) => { setOpenSupplier(o); if (!o) resetSupplierForm(); }}
        title={editing ? "Edit Supplier" : "Add Supplier"}
        description="Supplier balances are calculated using ledger-style logic (opening ± purchases ± payments)."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e)=>setForm(p=>({...p, fullName:e.target.value}))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e)=>setForm(p=>({...p, phone:e.target.value}))} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Legal Org Name</Label>
              <Input value={form.legalOrgName} onChange={(e)=>setForm(p=>({...p, legalOrgName:e.target.value}))} />
            </div>
            <div>
              <Label>Tax Number</Label>
              <Input value={form.taxNumber} onChange={(e)=>setForm(p=>({...p, taxNumber:e.target.value}))} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e)=>setForm(p=>({...p, email:e.target.value}))} />
            </div>
            <div>
              <Label>DOB</Label>
              <Input type="date" value={form.dob} onChange={(e)=>setForm(p=>({...p, dob:e.target.value}))} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Opening Balance Type</Label>
              <Select value={form.openingBalanceType} onValueChange={(v)=>setForm(p=>({...p, openingBalanceType: v as any}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="to_collect">To Collect</SelectItem>
                  <SelectItem value="to_pay">To Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Opening Amount</Label>
              <Input type="number" value={form.openingAmount} onChange={(e)=>setForm(p=>({...p, openingAmount:Number(e.target.value)}))} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setOpenSupplier(false)}>Cancel</Button>
            <Button onClick={saveSupplier}>{editing ? "Save" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={openTxn}
        onOpenChange={(o) => { setOpenTxn(o); }}
        title="Add Supplier Transaction"
        description="Purchase increases payable. Payment reduces payable. Adjustment adds/subtracts payable depending on sign (use positive to increase payable)."
      >
        <div className="space-y-4">
          <div>
            <Label>Supplier</Label>
            <Select value={txnForm.supplierId} onValueChange={(v)=>setTxnForm(p=>({...p, supplierId:v}))}>
              <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
              <SelectContent>
                {suppliers.map((s)=> <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Type</Label>
              <Select value={txnForm.type} onValueChange={(v)=>setTxnForm(p=>({...p, type:v as SupplierTxnType}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={txnForm.amount} onChange={(e)=>setTxnForm(p=>({...p, amount:Number(e.target.value)}))} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Date (optional)</Label>
              <Input type="date" value={txnForm.date} onChange={(e)=>setTxnForm(p=>({...p, date:e.target.value}))} />
            </div>
            <div>
              <Label>Reference</Label>
              <Input value={txnForm.reference} onChange={(e)=>setTxnForm(p=>({...p, reference:e.target.value}))} placeholder="INV-123" />
            </div>
          </div>

          <div>
            <Label>Note</Label>
            <Input value={txnForm.note} onChange={(e)=>setTxnForm(p=>({...p, note:e.target.value}))} placeholder="Optional" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setOpenTxn(false)}>Cancel</Button>
            <Button onClick={saveTxn}>Add Transaction</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
