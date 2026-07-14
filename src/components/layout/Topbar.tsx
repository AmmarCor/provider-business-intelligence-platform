import React from "react";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 pt-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-0.5 text-sm text-foreground-tertiary">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground-tertiary md:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Search bundles, payers…</span>
        </div>
        <ThemeToggle />
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground-tertiary hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-rose" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient text-xs font-semibold text-[#0B0D12]">
          MC
        </div>
      </div>
    </div>
  );
}
