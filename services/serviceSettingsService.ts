import type { ServiceSettings, MenuSet } from "@/types";
import { mockMenuSets } from "@/lib/mock-data";

// Mock initial settings
let serviceSettings: ServiceSettings = {
  dineInEnabled: true,
  activeMenuSetId: mockMenuSets[0]?.id || "mset-1",
  viewInvoiceEnabled: true,
  viewKOTEnabled: true,
  checkInEnabled: true,
  requireOrderConfirmation: true,
};

export const serviceSettingsService = {
  // Get current service settings
  async getServiceSettings(): Promise<ServiceSettings> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { ...serviceSettings };
  },

  // Update dine-in status
  async updateDineInStatus(enabled: boolean): Promise<ServiceSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    serviceSettings.dineInEnabled = enabled;
    return { ...serviceSettings };
  },

  // Update active menu set
  async updateActiveMenuSet(menuSetId: string): Promise<ServiceSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    serviceSettings.activeMenuSetId = menuSetId;
    return { ...serviceSettings };
  },

  // Update view invoice setting
  async updateViewInvoice(enabled: boolean): Promise<ServiceSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    serviceSettings.viewInvoiceEnabled = enabled;
    return { ...serviceSettings };
  },

  // Update view KOT setting
  async updateViewKOT(enabled: boolean): Promise<ServiceSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    serviceSettings.viewKOTEnabled = enabled;
    return { ...serviceSettings };
  },

  // Update check-in setting
  async updateCheckIn(enabled: boolean): Promise<ServiceSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    serviceSettings.checkInEnabled = enabled;
    return { ...serviceSettings };
  },

  // Update require order confirmation setting
  async updateRequireOrderConfirmation(enabled: boolean): Promise<ServiceSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    serviceSettings.requireOrderConfirmation = enabled;
    return { ...serviceSettings };
  },

  // Get all menu sets for dropdown
  async getMenuSets(): Promise<MenuSet[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockMenuSets;
  },
};
