import React from "react";
import { RotateCcw } from "lucide-react";
import { useFilters } from "@/hooks/useFilters";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { getAllBundles, getAllLocations, getAllPayers } from "@/utils/analytics";
import { CATEGORIES, REFERRAL_SOURCES, REFERRAL_SOURCE_LABELS, STATE_CODES, STATE_NAMES } from "@/types";

const DATE_RANGE_OPTIONS = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 180 days", value: "180" },
  { label: "Last 365 days", value: "365" },
];

export function GlobalFiltersBar() {
  const { filters, updateFilter, resetFilters, activeFilterCount } = useFilters();
  const locations = getAllLocations();
  const payers = getAllPayers();
  const bundles = getAllBundles();

  const locationOptions = [
    { label: "All locations", value: "all" },
    ...locations
      .filter((l) => filters.state === "all" || l.state === filters.state)
      .map((l) => ({ label: `${l.city}, ${l.state}`, value: l.id })),
  ];

  const bundleOptions = [
    { label: "All bundles", value: "all" },
    ...bundles
      .filter((b) => filters.category === "all" || b.category === filters.category)
      .slice(0, 200)
      .map((b) => ({ label: b.name, value: b.id })),
  ];

  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-border bg-background/80 px-6 py-3.5">
      <Select
        label="Date range"
        value={String(filters.dateRangeDays)}
        onChange={(v) => updateFilter("dateRangeDays", Number(v) as any)}
        options={DATE_RANGE_OPTIONS}
        className="w-40"
      />
      <Select
        label="State"
        value={filters.state}
        onChange={(v) => updateFilter("state", v as any)}
        options={[
          { label: "All states", value: "all" },
          ...STATE_CODES.map((s) => ({ label: STATE_NAMES[s], value: s })),
        ]}
        className="w-44"
      />
      <Select
        label="Location"
        value={filters.locationId}
        onChange={(v) => updateFilter("locationId", v as any)}
        options={locationOptions}
        className="w-48"
      />
      <Select
        label="Category"
        value={filters.category}
        onChange={(v) => updateFilter("category", v as any)}
        options={[{ label: "All categories", value: "all" }, ...CATEGORIES.map((c) => ({ label: c, value: c }))]}
        className="w-44"
      />
      <Select
        label="Bundle"
        value={filters.bundleId}
        onChange={(v) => updateFilter("bundleId", v as any)}
        options={bundleOptions}
        className="w-56"
      />
      <Select
        label="Payer"
        value={filters.payerId}
        onChange={(v) => updateFilter("payerId", v as any)}
        options={[{ label: "All payers", value: "all" }, ...payers.map((p) => ({ label: p.name, value: p.id }))]}
        className="w-52"
      />
      <Select
        label="Referral source"
        value={filters.referralSource}
        onChange={(v) => updateFilter("referralSource", v as any)}
        options={[
          { label: "All sources", value: "all" },
          ...REFERRAL_SOURCES.map((s) => ({ label: REFERRAL_SOURCE_LABELS[s], value: s })),
        ]}
        className="w-44"
      />
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="mb-0.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
