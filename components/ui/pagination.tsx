
import * as React from "react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  // Keep it simple (no ellipsis) but cap render count to avoid huge DOM.
  const safePages = pages.length > 15
    ? [
        1,
        ...pages.slice(
          Math.max(1, currentPage - 3),
          Math.min(totalPages - 1, currentPage + 2)
        ),
        totalPages,
      ]
    : pages

  const uniquePages = Array.from(new Set(safePages)).sort((a, b) => a - b)

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center flex-wrap gap-2", className)}
    >
      {uniquePages.map((page, idx) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm border transition",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            page === currentPage
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-muted border-border"
          )}
        >
          {page}
        </button>
      ))}
    </nav>
  )
}
