"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, RotateCcw, Truck, Store, Utensils } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/loading-state";
import {
  getServiceConfig,
  updateServiceConfig,
} from "@/services/serviceConfigService";
import type { ServiceConfig } from "@/types";

export function ServiceConfigContent() {
  const [config, setConfig] = useState<ServiceConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<ServiceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const data = await getServiceConfig();
      setConfig(data);
      setOriginalConfig(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await updateServiceConfig(config);
      setOriginalConfig(config);
      toast.success("Service configuration updated");
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalConfig) {
      setConfig(originalConfig);
    }
  };

  if (loading || !config) return <LoadingSpinner />;

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  return (
    <div className="space-y-6">
      {/* Restaurant Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Store className="h-5 w-5" />
            Restaurant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rest-name" className="text-sm font-medium">
              Restaurant Name
            </Label>
            <Input
              id="rest-name"
              value={config.restaurantName}
              onChange={(e) =>
                setConfig({ ...config, restaurantName: e.target.value })
              }
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Service Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-sm font-medium">Dine-In Service</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow customers to order at tables
              </p>
            </div>
            <Switch
              checked={config.dineInEnabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, dineInEnabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-sm font-medium">Takeaway Service</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow customers to order for takeaway
              </p>
            </div>
            <Switch
              checked={config.takeawayEnabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, takeawayEnabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-sm font-medium">Delivery Service</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow customers to order for delivery
              </p>
            </div>
            <Switch
              checked={config.deliveryEnabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, deliveryEnabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Configuration */}
      {config.deliveryEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery-radius" className="text-sm font-medium">
                  Delivery Radius (km)
                </Label>
                <Input
                  id="delivery-radius"
                  type="number"
                  min="0"
                  value={config.deliveryRadius || 0}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      deliveryRadius: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="delivery-fee" className="text-sm font-medium">
                  Delivery Fee ($)
                </Label>
                <Input
                  id="delivery-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={config.deliveryFee || 0}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      deliveryFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="min-delivery-order"
                className="text-sm font-medium"
              >
                Minimum Order Amount for Delivery ($)
              </Label>
              <Input
                id="min-delivery-order"
                type="number"
                min="0"
                step="0.01"
                value={config.minDeliveryOrder || 0}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    minDeliveryOrder: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estimated Times */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Estimated Preparation Times</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="est-dinein" className="text-sm font-medium">
                Dine-In (min)
              </Label>
              <Input
                id="est-dinein"
                type="number"
                min="0"
                value={config.estimatedDineInTime || 0}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    estimatedDineInTime: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="est-takeaway" className="text-sm font-medium">
                Takeaway (min)
              </Label>
              <Input
                id="est-takeaway"
                type="number"
                min="0"
                value={config.estimatedTakeawayTime || 0}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    estimatedTakeawayTime: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="est-delivery" className="text-sm font-medium">
                Delivery (min)
              </Label>
              <Input
                id="est-delivery"
                type="number"
                min="0"
                value={config.estimatedDeliveryTime || 0}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    estimatedDeliveryTime: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex gap-2 justify-end">
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
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
