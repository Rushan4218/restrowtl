"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LoadingTable } from "@/components/shared/loading-state";
import {
  getBusinessHours,
  updateBusinessHours,
} from "@/services/businessHoursService";
import type { BusinessHours } from "@/types";

export function BusinessHoursContent() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const loadHours = useCallback(async () => {
    try {
      const data = await getBusinessHours();
      setHours(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHours();
  }, [loadHours]);

  const handleUpdate = async (id: string, field: string, value: string | boolean) => {
    setHours((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const handleSave = async (bh: BusinessHours) => {
    setSaving(bh.id);
    try {
      await updateBusinessHours(bh.id, {
        openTime: bh.openTime,
        closeTime: bh.closeTime,
        isClosed: bh.isClosed,
      });
      toast.success(`${bh.day} hours updated successfully`);
    } catch {
      toast.error("Failed to update hours");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingTable rows={7} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-primary" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hours.map((bh) => (
            <div
              key={bh.id}
              className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-28">
                  <span className="font-medium text-foreground">{bh.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!bh.isClosed}
                    onCheckedChange={(checked) =>
                      handleUpdate(bh.id, "isClosed", !checked)
                    }
                    aria-label={`Toggle ${bh.day}`}
                  />
                  <Label className="text-sm text-muted-foreground">
                    {bh.isClosed ? "Closed" : "Open"}
                  </Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={bh.openTime}
                  onChange={(e) =>
                    handleUpdate(bh.id, "openTime", e.target.value)
                  }
                  disabled={bh.isClosed}
                  className="w-32"
                  aria-label={`${bh.day} opening time`}
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={bh.closeTime}
                  onChange={(e) =>
                    handleUpdate(bh.id, "closeTime", e.target.value)
                  }
                  disabled={bh.isClosed}
                  className="w-32"
                  aria-label={`${bh.day} closing time`}
                />
                <Button
                  size="sm"
                  onClick={() => handleSave(bh)}
                  disabled={saving === bh.id}
                >
                  <Save className="mr-1 h-3.5 w-3.5" />
                  {saving === bh.id ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
