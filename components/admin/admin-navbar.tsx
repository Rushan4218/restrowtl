"use client";

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminNavbarProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backButton?: boolean;
  backHref?: string;
}

export function AdminNavbar({
  title,
  subtitle,
  action,
  backButton = false,
  backHref = "/admin",
}: AdminNavbarProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 mb-8">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6 lg:px-8 py-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {backButton && (
            <Link
              href={backHref}
              className="flex-shrink-0 rounded-md p-2 hover:bg-muted transition-colors"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
