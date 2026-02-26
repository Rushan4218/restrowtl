"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  ClipboardCheck,
  LayoutDashboard,
  QrCode,
  UserCircle,
  LogOut,
  Receipt,
  User,
  Clock,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useCart } from "@/hooks/use-cart";
import { useTable } from "@/hooks/use-table";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceSession } from "@/hooks/use-device-session";
import { OrderConfirmModal } from "./order-confirm-modal";
import { AuthModal } from "./auth-modal";
import { RingBellModal } from "./ring-bell-modal";

export function CustomerHeader() {
  const { totalItems } = useCart();
  const { selectedTable: qrTable, isTableLocked } = useTable();
  const { user, isAuthenticated, logout } = useAuth();
  const { session: deviceSession, isSessionActive, remainingMinutes } =
    useDeviceSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bellModalOpen, setBellModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/menu" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">
              RestroHub
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isTableLocked && qrTable && (
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <QrCode className="h-3 w-3" />
                Table: {qrTable.name}
              </Badge>
            )}

            {isSessionActive && deviceSession && (
              <Link href="/menu/order-confirmation">
                <Badge
                  variant="secondary"
                  className="cursor-pointer gap-1 bg-emerald-100 text-emerald-700 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                >
                  <Clock className="h-3 w-3" />
                  {deviceSession.orderIds.length} order
                  {deviceSession.orderIds.length !== 1 ? "s" : ""} &middot;{" "}
                  {remainingMinutes}m
                </Badge>
              </Link>
            )}

            {/* Auth section */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden max-w-[100px] truncate text-sm sm:inline">
                      {user.fullName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/menu/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/menu/orders" className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Order History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => setAuthModalOpen(true)}
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            {/* Bell Button - Always visible */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setBellModalOpen(true)}
              title="Ring bell for assistance"
            >
              <Bell className="h-4 w-4" />
            </Button>

            <ThemeToggle />
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-1.5 sm:flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Button>
            </Link>
            <Button
              size="sm"
              className="relative gap-1.5"
              disabled={totalItems === 0}
              onClick={() => setModalOpen(true)}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Confirm Order</span>
              {totalItems > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground p-0 text-xs text-background">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <OrderConfirmModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentUser={user}
      />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <RingBellModal open={bellModalOpen} onOpenChange={setBellModalOpen} />
    </>
  );
}
