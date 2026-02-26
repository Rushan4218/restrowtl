"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, FileText, RotateCcw, Bell, Plus, X, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCancellationPolicy,
  updateCancellationPolicy,
} from "@/services/cancellationPolicyService";
import { getBellReasons, saveBellReasons } from "@/services/configService";
import {
  getMenuFilters,
  addMenuFilter,
  removeMenuFilter,
  getOrderModifiers,
  addOrderModifier,
  removeOrderModifier,
} from "@/services/serviceConfigService";
import { generateId } from "@/services/api";
import type { MenuFilter, OrderModifier } from "@/types";

export function SettingsContent() {
  // Cancellation Policy
  const [policyText, setPolicyText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Bell Reasons
  const [bellReasons, setBellReasons] = useState<string[]>([]);
  const [originalReasons, setOriginalReasons] = useState<string[]>([]);
  const [newReason, setNewReason] = useState("");
  const [savingReasons, setSavingReasons] = useState(false);

  // Menu Filters
  const [filters, setFilters] = useState<MenuFilter[]>([]);
  const [newFilterName, setNewFilterName] = useState("");
  const [newFilterType, setNewFilterType] = useState<"dietary" | "allergen" | "spice" | "custom">("dietary");

  // Order Modifiers
  const [modifiers, setModifiers] = useState<OrderModifier[]>([]);
  const [newModifierName, setNewModifierName] = useState("");

  const loadPolicy = useCallback(async () => {
    try {
      const text = await getCancellationPolicy();
      setPolicyText(text);
      setOriginalText(text);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBellReasons = useCallback(async () => {
    try {
      const reasons = await getBellReasons();
      setBellReasons(reasons);
      setOriginalReasons(reasons);
    } catch {
      toast.error("Failed to load bell reasons");
    }
  }, []);

  const loadFilters = useCallback(async () => {
    try {
      const data = await getMenuFilters();
      setFilters(data);
    } catch {
      toast.error("Failed to load menu filters");
    }
  }, []);

  const loadModifiers = useCallback(async () => {
    try {
      const data = await getOrderModifiers();
      setModifiers(data);
    } catch {
      toast.error("Failed to load order modifiers");
    }
  }, []);

  useEffect(() => {
    Promise.all([loadPolicy(), loadBellReasons(), loadFilters(), loadModifiers()]);
  }, [loadPolicy, loadBellReasons, loadFilters, loadModifiers]);

  const handleSave = async () => {
    if (!policyText.trim()) {
      toast.error("Policy text cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateCancellationPolicy(policyText);
      setOriginalText(updated);
      toast.success("Cancellation policy updated successfully");
    } catch {
      toast.error("Failed to update cancellation policy");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPolicyText(originalText);
  };

  const handleAddReason = () => {
    const trimmed = newReason.trim();
    if (!trimmed) return;
    if (bellReasons.includes(trimmed)) {
      toast.error("This reason already exists");
      return;
    }
    setBellReasons([...bellReasons, trimmed]);
    setNewReason("");
  };

  const handleRemoveReason = (reason: string) => {
    setBellReasons(bellReasons.filter((r) => r !== reason));
  };

  const handleSaveBellReasons = async () => {
    if (bellReasons.length === 0) {
      toast.error("You must have at least one bell reason");
      return;
    }
    setSavingReasons(true);
    try {
      await saveBellReasons(bellReasons);
      setOriginalReasons(bellReasons);
      toast.success("Bell reasons updated successfully");
    } catch {
      toast.error("Failed to update bell reasons");
    } finally {
      setSavingReasons(false);
    }
  };

  const handleResetReasons = () => {
    setBellReasons(originalReasons);
  };

  const handleAddFilter = async () => {
    if (!newFilterName.trim()) {
      toast.error("Filter name is required");
      return;
    }

    try {
      const newFilter: MenuFilter = {
        id: generateId("f"),
        name: newFilterName,
        type: newFilterType,
      };
      const updated = await addMenuFilter(newFilter);
      setFilters(updated);
      setNewFilterName("");
      toast.success("Filter added successfully");
    } catch {
      toast.error("Failed to add filter");
    }
  };

  const handleRemoveFilter = async (filterId: string) => {
    try {
      const updated = await removeMenuFilter(filterId);
      setFilters(updated);
      toast.success("Filter removed");
    } catch {
      toast.error("Failed to remove filter");
    }
  };

  const handleAddModifier = async () => {
    if (!newModifierName.trim()) {
      toast.error("Modifier name is required");
      return;
    }

    try {
      const newModifier: OrderModifier = {
        id: generateId("mod"),
        name: newModifierName,
        isRequired: false,
        options: [],
      };
      const updated = await addOrderModifier(newModifier);
      setModifiers(updated);
      setNewModifierName("");
      toast.success("Modifier added successfully");
    } catch {
      toast.error("Failed to add modifier");
    }
  };

  const handleRemoveModifier = async (modifierId: string) => {
    try {
      const updated = await removeOrderModifier(modifierId);
      setModifiers(updated);
      toast.success("Modifier removed");
    } catch {
      toast.error("Failed to remove modifier");
    }
  };

  const hasChanges = policyText !== originalText;
  const hasReasonChanges = JSON.stringify(bellReasons) !== JSON.stringify(originalReasons);

  if (loading) return <LoadingSpinner />;

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="menu">Menu Settings</TabsTrigger>
        <TabsTrigger value="policy">Policies</TabsTrigger>
      </TabsList>

      {/* General Tab - Bell Reasons */}
      <TabsContent value="general" className="space-y-6">
      {/* Bell Reasons Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">
              Bell Assistance Reasons
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage the list of reasons customers can select when ringing the bell for assistance.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Reasons</Label>
            <div className="space-y-2">
              {bellReasons.map((reason) => (
                <div
                  key={reason}
                  className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
                >
                  <span className="text-sm text-foreground">{reason}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReason(reason)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {bellReasons.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No reasons added yet
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-reason">Add New Reason</Label>
            <div className="flex gap-2">
              <Input
                id="new-reason"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g., Water, Menu, Bill..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddReason();
                  }
                }}
              />
              <Button onClick={handleAddReason} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {hasReasonChanges ? "You have unsaved changes." : "No changes to save."}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleResetReasons}
                disabled={!hasReasonChanges || savingReasons}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleSaveBellReasons}
                disabled={!hasReasonChanges || savingReasons}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {savingReasons ? "Saving..." : "Save Reasons"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bell Assistance - Customer Preview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">
              Customer Preview
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            This is how bell assistance reasons will appear to customers when they click the bell icon. A bell sound will play when they select any reason.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Available reasons:</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {bellReasons.map((reason) => (
                <div
                  key={reason}
                  className="flex items-center gap-2 rounded-md border border-primary/30 bg-background p-3 text-sm"
                >
                  <Bell className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-foreground">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Policy Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">
              Order Cancellation Policy
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            This text is displayed to customers when they attempt to cancel an
            order. You can edit it at any time.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="policy-text">Policy Text</Label>
            <Textarea
              id="policy-text"
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              rows={12}
              className="font-mono text-sm leading-relaxed"
              placeholder="Enter your cancellation policy text..."
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {hasChanges ? "You have unsaved changes." : "No changes to save."}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || saving}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Policy"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">
            Customer Preview
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            This is how the policy will appear to customers.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-muted/50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {policyText || "No policy text set."}
            </p>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      {/* Menu Settings Tab */}
      <TabsContent value="menu" className="space-y-6">
        {/* Menu Filters Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-foreground">Menu Filters</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tags like Vegetarian, Spicy, Gluten-Free to help customers find items
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {}}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Filter
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {filters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No filters configured yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-foreground">{filter.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {filter.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFilter(filter.id)}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 border-t pt-4">
              <div>
                <Label htmlFor="filter-name" className="text-sm font-medium">
                  Filter Name
                </Label>
                <Input
                  id="filter-name"
                  placeholder="e.g., Vegetarian, Spicy, Gluten-Free"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="filter-type" className="text-sm font-medium">
                  Filter Type
                </Label>
                <select
                  id="filter-type"
                  value={newFilterType}
                  onChange={(e) =>
                    setNewFilterType(
                      e.target.value as "dietary" | "allergen" | "spice" | "custom"
                    )
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="dietary">Dietary</option>
                  <option value="allergen">Allergen</option>
                  <option value="spice">Spice</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <Button onClick={handleAddFilter} className="gap-2 w-full">
                <Plus className="h-4 w-4" />
                Add Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Modifiers Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-foreground">Order Modifiers</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Size, toppings, and other customization options
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {modifiers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No modifiers configured yet.
              </p>
            ) : (
              <div className="space-y-3">
                {modifiers.map((modifier) => (
                  <div
                    key={modifier.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{modifier.name}</p>
                          <Badge variant={modifier.isRequired ? "default" : "outline"}>
                            {modifier.isRequired ? "Required" : "Optional"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {modifier.options.length} options
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveModifier(modifier.id)}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 border-t pt-4">
              <div>
                <Label htmlFor="modifier-name" className="text-sm font-medium">
                  Modifier Name
                </Label>
                <Input
                  id="modifier-name"
                  placeholder="e.g., Size, Toppings, Sauce"
                  value={newModifierName}
                  onChange={(e) => setNewModifierName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button onClick={handleAddModifier} className="gap-2 w-full">
                <Plus className="h-4 w-4" />
                Add Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Policies Tab */}
      <TabsContent value="policy" className="space-y-6">
        {/* Bell Reasons Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">
                Bell Assistance Reasons
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage the list of reasons customers can select when ringing the bell for assistance.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Reasons</Label>
              <div className="space-y-2">
                {bellReasons.map((reason) => (
                  <div
                    key={reason}
                    className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm text-foreground">{reason}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveReason(reason)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {bellReasons.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No reasons added yet
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-reason">Add New Reason</Label>
              <div className="flex gap-2">
                <Input
                  id="new-reason"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g., Water, Menu, Bill..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddReason();
                    }
                  }}
                />
                <Button onClick={handleAddReason} className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {hasReasonChanges ? "You have unsaved changes." : "No changes to save."}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleResetReasons}
                  disabled={!hasReasonChanges || savingReasons}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  onClick={handleSaveBellReasons}
                  disabled={!hasReasonChanges || savingReasons}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savingReasons ? "Saving..." : "Save Reasons"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Policy Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">
                Order Cancellation Policy
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              This text is displayed to customers when they attempt to cancel an
              order. You can edit it at any time.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="policy-text">Policy Text</Label>
              <Textarea
                id="policy-text"
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                rows={12}
                className="font-mono text-sm leading-relaxed"
                placeholder="Enter your cancellation policy text..."
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {hasChanges ? "You have unsaved changes." : "No changes to save."}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges || saving}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Policy"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-foreground">
              Customer Preview
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              This is how the policy will appear to customers.
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-muted/50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {policyText || "No policy text set."}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
