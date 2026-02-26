"use client";

import { useEffect, useMemo, useState } from "react";
import { adminAttributeService } from "@/services/adminAttributeService";
import type { CustomerAttribute } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function AttributeMultiSelect({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
}) {
  const [attributes, setAttributes] = useState<CustomerAttribute[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await adminAttributeService.getAttributes();
      if (!mounted) return;
      setAttributes(all);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return attributes;
    return attributes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q)
    );
  }, [attributes, query]);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const toggle = (id: string, checked: boolean) => {
    if (checked) onChange(Array.from(new Set([...value, id])));
    else onChange(value.filter((x) => x !== id));
  };

  const selectedBadges = useMemo(() => {
    const byId = new Map(attributes.map((a) => [a.id, a] as const));
    return value
      .map((id) => byId.get(id))
      .filter(Boolean) as CustomerAttribute[];
  }, [value, attributes]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search attributes..."
            className="pl-8"
          />
        </div>
      </div>

      {selectedBadges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedBadges.map((a) => (
            <Badge key={a.id} variant="secondary">
              {a.name}
            </Badge>
          ))}
        </div>
      )}

      <ScrollArea className="mt-3 h-44 rounded-md border bg-background">
        <div className="p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No attributes</div>
          ) : (
            filtered.map((a) => (
              <label
                key={a.id}
                className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={selectedSet.has(a.id)}
                  onCheckedChange={(v) => toggle(a.id, Boolean(v))}
                />
                <div className="leading-tight">
                  <div className="text-sm font-medium">{a.name}</div>
                  {a.description ? (
                    <div className="text-xs text-muted-foreground">{a.description}</div>
                  ) : null}
                </div>
              </label>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
