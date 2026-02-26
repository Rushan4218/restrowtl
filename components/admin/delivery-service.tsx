"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";

export function DeliveryService() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"details" | "hours">("details");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [fixedCharge, setFixedCharge] = useState(0);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(0);
  const [minimumCart, setMinimumCart] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const restaurantName = "sajilo momo";
  const restaurantPhone = "+977 9843269194";
  const restaurantAddress = "Kathmandu, Nepal";
  const deliveryMenuUrl = "sajilomomo.restro.link/en/delivery/";
  const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(deliveryMenuUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deliveryMenuUrl);
    toast({
      description: "Delivery menu link copied to clipboard",
    });
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = "delivery-qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      description: "QR code downloaded",
    });
  };

  const handleToggleDelivery = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDeliveryEnabled(!deliveryEnabled);
    setIsLoading(false);
    toast({
      description: `Delivery service ${!deliveryEnabled ? "enabled" : "disabled"}`,
    });
  };

  const handleSaveCharges = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    toast({
      description: "Delivery charges updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "details"
              ? "bg-red-600 text-white rounded-t-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Delivery Details
        </button>
        <button
          onClick={() => setActiveTab("hours")}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "hours"
              ? "bg-red-600 text-white rounded-t-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Opening Hour
        </button>
      </div>

      {activeTab === "details" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Status and Menu Set */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status and Menu Set</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Toggle */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      This means you are serving delivery service in your restaurant or not.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleDelivery}
                    disabled={isLoading}
                    className={`ml-4 w-6 h-6 rounded-full ${
                      deliveryEnabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>

                {/* Active Menu Set */}
                <div>
                  <label className="text-sm font-medium">Active Menu Set</label>
                  <select className="w-full mt-2 px-3 py-2 border rounded-md bg-background">
                    <option>Default Menuset</option>
                    <option>Breakfast Menu</option>
                    <option>Lunch Menu</option>
                    <option>Dinner Menu</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Others */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Others</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* View Invoice */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">View Invoice</p>
                    <p className="text-xs text-muted-foreground">
                      Customer can view invoice, they will see final amount of their orders too.
                    </p>
                  </div>
                  <button className="ml-4 w-5 h-5 rounded-full bg-green-500" />
                </div>

                {/* View KOT */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">View KOT</p>
                    <p className="text-xs text-muted-foreground">
                      Customer can view KOT, they can't see the amount of orders. Only see number of items.
                    </p>
                  </div>
                  <button className="ml-4 w-5 h-5 rounded-full bg-green-500" />
                </div>

                {/* Require Order Confirmation */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Require Order Confirmation</p>
                    <p className="text-xs text-muted-foreground">
                      If you enable this, you will have to confirm order before it goes to kitchen.
                    </p>
                  </div>
                  <button className="ml-4 w-5 h-5 rounded-full bg-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Share Delivery Menu */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Delivery Menu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
                  <img src={qrCodeUrl} alt="Delivery Menu QR Code" className="w-48 h-48" />
                </div>
                <div className="text-center">
                  <p className="font-medium mb-2">Delivery Menu</p>
                  <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
                    <span className="text-sm text-red-600 font-mono break-all">{deliveryMenuUrl}</span>
                    <button
                      onClick={handleCopyLink}
                      className="p-1 hover:bg-red-100 rounded"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDownloadQR}
                      className="p-1 hover:bg-red-100 rounded"
                      title="Download QR"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charges */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Charges</CardTitle>
                <button className="text-primary hover:text-primary/80">✏️</button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">Fixed Delivery Charge</label>
                    <span className="text-sm font-medium">Rs {fixedCharge}</span>
                  </div>
                  <input
                    type="number"
                    value={fixedCharge}
                    onChange={(e) => setFixedCharge(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Delivery charge of Rs {fixedCharge} will be added in the bill.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">Free Delivery Above</label>
                    <span className="text-sm font-medium">Rs {freeDeliveryAbove}</span>
                  </div>
                  <input
                    type="number"
                    value={freeDeliveryAbove}
                    onChange={(e) => setFreeDeliveryAbove(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Home delivery will be free for orders above Rs {freeDeliveryAbove}.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">Minimum Cart Value for Delivery</label>
                    <span className="text-sm font-medium">Rs {minimumCart}</span>
                  </div>
                  <input
                    type="number"
                    value={minimumCart}
                    onChange={(e) => setMinimumCart(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum cart value for delivery should be Rs {minimumCart}.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Information Shown in Menu */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Information Shown in Menu</CardTitle>
                <button className="text-primary hover:text-primary/80">✏️</button>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">:</span>
                  <span className="text-right flex-1 ml-4">{restaurantName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">:</span>
                  <span className="text-right flex-1 ml-4">{restaurantPhone}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium">:</span>
                  <span className="text-right flex-1 ml-4">{restaurantAddress}</span>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSaveCharges}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "hours" && (
        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
            <CardDescription>Configure opening hours for delivery service</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Opening hours configuration coming soon</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
