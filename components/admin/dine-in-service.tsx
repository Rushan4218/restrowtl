"use client";

import { useEffect, useState } from "react";
import { serviceSettingsService } from "@/services/serviceSettingsService";
import type { ServiceSettings, MenuSet } from "@/types";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface FeatureToggle {
  key: keyof ServiceSettings;
  label: string;
  description: string;
  enabled: boolean;
  isLoading: boolean;
}

export function DineInService() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ServiceSettings | null>(null);
  const [menuSets, setMenuSets] = useState<MenuSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
    loadMenuSets();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await serviceSettingsService.getServiceSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load service settings:", error);
      toast({
        title: "Error",
        description: "Failed to load service settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMenuSets = async () => {
    try {
      const data = await serviceSettingsService.getMenuSets();
      setMenuSets(data);
    } catch (error) {
      console.error("Failed to load menu sets:", error);
    }
  };

  const handleDineInToggle = async (enabled: boolean) => {
    setToggleLoading((prev) => ({ ...prev, dineInEnabled: true }));
    try {
      const updated = await serviceSettingsService.updateDineInStatus(enabled);
      setSettings(updated);
      toast({
        title: "Success",
        description: `Dine-in service ${enabled ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Failed to update dine-in status:", error);
      toast({
        title: "Error",
        description: "Failed to update dine-in status",
        variant: "destructive",
      });
    } finally {
      setToggleLoading((prev) => ({ ...prev, dineInEnabled: false }));
    }
  };

  const handleMenuSetChange = async (menuSetId: string) => {
    setToggleLoading((prev) => ({ ...prev, activeMenuSetId: true }));
    try {
      const updated = await serviceSettingsService.updateActiveMenuSet(menuSetId);
      setSettings(updated);
      toast({
        title: "Success",
        description: "Active menu set updated",
      });
    } catch (error) {
      console.error("Failed to update menu set:", error);
      toast({
        title: "Error",
        description: "Failed to update menu set",
        variant: "destructive",
      });
    } finally {
      setToggleLoading((prev) => ({ ...prev, activeMenuSetId: false }));
    }
  };

  const handleFeatureToggle = async (key: keyof ServiceSettings, enabled: boolean) => {
    setToggleLoading((prev) => ({ ...prev, [key]: true }));
    try {
      let updated: ServiceSettings;

      if (key === "viewInvoiceEnabled") {
        updated = await serviceSettingsService.updateViewInvoice(enabled);
      } else if (key === "viewKOTEnabled") {
        updated = await serviceSettingsService.updateViewKOT(enabled);
      } else if (key === "checkInEnabled") {
        updated = await serviceSettingsService.updateCheckIn(enabled);
      } else if (key === "requireOrderConfirmation") {
        updated = await serviceSettingsService.updateRequireOrderConfirmation(enabled);
      } else {
        return;
      }

      setSettings(updated);
      toast({
        title: "Success",
        description: `Setting updated successfully`,
      });
    } catch (error) {
      console.error("Failed to update setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } finally {
      setToggleLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading service settings...</p>
        </div>
      </div>
    );
  }

  const features: FeatureToggle[] = [
    {
      key: "viewInvoiceEnabled",
      label: "View Invoice",
      description: "Customer can view invoice, they will see final amount of their orders too.",
      enabled: settings.viewInvoiceEnabled,
      isLoading: toggleLoading.viewInvoiceEnabled || false,
    },
    {
      key: "viewKOTEnabled",
      label: "View KOT",
      description: "Customer can view KOT, they can't see the amount of orders. Only see number of items.",
      enabled: settings.viewKOTEnabled,
      isLoading: toggleLoading.viewKOTEnabled || false,
    },
    {
      key: "checkInEnabled",
      label: "Check-In",
      description: "While creating order you can add check-in option for dine-in customers details.",
      enabled: settings.checkInEnabled,
      isLoading: toggleLoading.checkInEnabled || false,
    },
    {
      key: "requireOrderConfirmation",
      label: "Require Order Confirmation",
      description: "If you enable this, you will have to confirm order before it goes to kitchen.",
      enabled: settings.requireOrderConfirmation,
      isLoading: toggleLoading.requireOrderConfirmation || false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Status and Menu Set Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Status and Menu set</h2>

        {/* Dine In Status Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Status</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This means you are serving dine in service in your restaurant or not.
              </p>
            </div>
            <Switch
              checked={settings.dineInEnabled}
              onCheckedChange={handleDineInToggle}
              disabled={toggleLoading.dineInEnabled}
              className="ml-4"
            />
          </div>
        </Card>

        {/* Active Menu Set Dropdown */}
        <Card className="p-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Active Menu Set</h3>
            <Select 
              value={settings.activeMenuSetId} 
              onValueChange={handleMenuSetChange}
              disabled={toggleLoading.activeMenuSetId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a menu set" />
              </SelectTrigger>
              <SelectContent>
                {menuSets.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Others Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Others</h2>
        <div className="space-y-3">
          {features.map((feature) => (
            <Card key={feature.key} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{feature.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                  disabled={feature.isLoading}
                  className="ml-4"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
