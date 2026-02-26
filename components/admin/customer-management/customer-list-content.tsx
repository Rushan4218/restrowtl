"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { adminCustomerService } from "@/services/adminCustomerService";
import { adminAttributeService } from "@/services/adminAttributeService";
import type { CustomerAttribute, CustomerProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerFormModal } from "./customer-form-modal";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import {
  AdminHeader,
  AdminCard,
  AdminTableHeader,
  AdminTableCell,
  AdminTableRow,
  AdminActionButton,
  AdminEmptyState,
} from "@/components/admin/shared/admin-components";

const ITEMS_PER_PAGE = 10;

export function CustomerListContent() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [attributes, setAttributes] = useState<CustomerAttribute[]>([]);

  const [q, setQ] = useState("");
  const [selectedAttr, setSelectedAttr] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<CustomerProfile | null>(null);

  const attrById = useMemo(() => new Map(attributes.map((a) => [a.id, a] as const)), [attributes]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cust, attrs] = await Promise.all([
        adminCustomerService.getCustomers(),
        adminAttributeService.getAttributes(),
      ]);
      setCustomers(cust);
      setAttributes(attrs);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to load customers");
      setCustomers([]);
      setAttributes([]);
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
    let list = [...customers];

    if (query) {
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(query) ||
          c.telephone.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query)
      );
    }

    if (selectedAttr.length > 0) {
      const wanted = new Set(selectedAttr);
      list = list.filter((c) => c.attributeIds?.some((id) => wanted.has(id)));
    }

    return list;
  }, [customers, q, selectedAttr]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [q, selectedAttr]);

  const toggleAttr = (id: string, checked: boolean) => {
    if (checked) setSelectedAttr((p) => Array.from(new Set([...p, id])));
    else setSelectedAttr((p) => p.filter((x) => x !== id));
  };

  const openNew = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const openEdit = (c: CustomerProfile) => {
    setEditing(c);
    setOpenForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    try {
      await adminCustomerService.deleteCustomer(id);
      toast.success("Customer deleted");
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete customer");
    }
  };

  const submit = async (payload: any, id?: string) => {
    try {
      if (id) {
        await adminCustomerService.updateCustomer(id, payload);
        toast.success("Customer updated");
      } else {
        await adminCustomerService.createCustomer(payload);
        toast.success("Customer created");
      }
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save customer");
      throw e;
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Customer Directory"
        subtitle={`Manage ${customers.length} customer${customers.length !== 1 ? "s" : ""}`}
        action={
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Customer
          </Button>
        }
      />

      {/* Search and Filter Card */}
      <AdminCard>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, phone, or email..."
              className="pl-9"
            />
          </div>

          {/* Attribute Filters */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
              Filter by Attributes
            </Label>
            <div className="flex flex-wrap gap-2">
              {attributes.length === 0 ? (
                <span className="text-sm text-muted-foreground">No attributes available</span>
              ) : (
                attributes.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedAttr.includes(a.id)}
                      onCheckedChange={(v) => toggleAttr(a.id, Boolean(v))}
                    />
                    <span>{a.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </AdminCard>

        {/* Customers Table */}
      <AdminCard className="p-0 overflow-hidden border border-border bg-card">
        <div className="p-5 border-b border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> customer{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <AdminTableHeader
              columns={["Customer", "Phone", "Email", "Attributes", "Actions"]}
            />
            <tbody>
              {loading ? (
                <AdminTableRow hover={false}>
                  <AdminTableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">Loading customers...</div>
                  </AdminTableCell>
                </AdminTableRow>
              ) : filtered.length === 0 ? (
                <AdminTableRow hover={false}>
                  <AdminTableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">No customers found</div>
                  </AdminTableCell>
                </AdminTableRow>
              ) : (
                paginated.map((c) => (
                  <AdminTableRow key={c.id}>
                    <AdminTableCell>
                      <div className="font-medium text-card-foreground">{c.fullName}</div>
                      {c.companyName && (
                        <div className="text-xs text-muted-foreground mt-0.5">{c.companyName}</div>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-card-foreground">{c.telephone}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-card-foreground">{c.email}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-1">
                        {(c.attributeIds ?? []).slice(0, 2).map((id) => {
                          const a = attrById.get(id);
                          if (!a) return null;
                          return (
                            <Badge key={id} variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                              {a.name}
                            </Badge>
                          );
                        })}
                        {(c.attributeIds ?? []).length > 2 && (
                          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                            +{(c.attributeIds ?? []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <AdminActionButton
                          variant="ghost"
                          onClick={() => openEdit(c)}
                          title="Edit customer"
                          className="text-primary hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </AdminActionButton>
                        <AdminActionButton
                          variant="ghost"
                          onClick={() => remove(c.id)}
                          title="Delete customer"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </AdminActionButton>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-center gap-2 bg-card">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground px-3">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </AdminCard>

      <CustomerFormModal
        open={openForm}
        onOpenChange={setOpenForm}
        initial={editing}
        onSubmit={submit}
      />
    </div>
  );
}
