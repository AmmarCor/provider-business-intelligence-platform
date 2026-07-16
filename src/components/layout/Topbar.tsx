import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useFilters } from "@/hooks/useFilters";
import { getAllBundles, getAllPayers } from "@/utils/analytics";

const MAX_RESULTS_PER_GROUP = 4;

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { updateFilter } = useFilters();
  const bundles = getAllBundles();
  const payers = getAllPayers();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim().toLowerCase();

  const matchedBundles = useMemo(() => {
    if (!trimmedQuery) return [];
    return bundles.filter((b) => b.name.toLowerCase().includes(trimmedQuery)).slice(0, MAX_RESULTS_PER_GROUP);
  }, [bundles, trimmedQuery]);

  const matchedPayers = useMemo(() => {
    if (!trimmedQuery) return [];
    return payers.filter((p) => p.name.toLowerCase().includes(trimmedQuery)).slice(0, MAX_RESULTS_PER_GROUP);
  }, [payers, trimmedQuery]);

  const hasResults = matchedBundles.length > 0 || matchedPayers.length > 0;

  // Close on outside click, matching the pattern already used by the
  // InfoTooltip system elsewhere in the app.
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectBundle = (bundleId: string) => {
    updateFilter("bundleId", bundleId);
    setQuery("");
    setIsOpen(false);
  };

  const selectPayer = (payerId: string) => {
    updateFilter("payerId", payerId);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 px-6 pt-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-0.5 text-sm text-foreground-tertiary">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div ref={containerRef} className="relative hidden md:block">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground-tertiary focus-within:border-border-strong">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search bundles, payers…"
              aria-label="Search bundles and payers"
              className="w-40 bg-transparent text-foreground outline-none placeholder:text-foreground-tertiary"
            />
          </div>

          {isOpen && trimmedQuery && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl2 border border-border-strong bg-surface p-1.5 shadow-panel-light backdrop-blur-md dark:shadow-panel">
              {!hasResults && (
                <p className="px-2.5 py-2 text-xs text-foreground-tertiary">No bundles or payers match "{query}".</p>
              )}

              {matchedBundles.length > 0 && (
                <div className="mb-1">
                  <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-quaternary">Bundles</p>
                  {matchedBundles.map((bundle) => (
                    <button
                      key={bundle.id}
                      type="button"
                      onClick={() => selectBundle(bundle.id)}
                      className="block w-full truncate rounded-md px-2.5 py-1.5 text-left text-xs text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                    >
                      {bundle.name}
                    </button>
                  ))}
                </div>
              )}

              {matchedPayers.length > 0 && (
                <div>
                  <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-quaternary">Payers</p>
                  {matchedPayers.map((payer) => (
                    <button
                      key={payer.id}
                      type="button"
                      onClick={() => selectPayer(payer.id)}
                      className="block w-full truncate rounded-md px-2.5 py-1.5 text-left text-xs text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                    >
                      {payer.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
