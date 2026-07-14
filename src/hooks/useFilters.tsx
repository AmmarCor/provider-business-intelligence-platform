import React, { createContext, useContext, useMemo, useState } from "react";
import { GlobalFilters } from "@/types";

const DEFAULT_FILTERS: GlobalFilters = {
  dateRangeDays: 90,
  state: "all",
  locationId: "all",
  category: "all",
  bundleId: "all",
  payerId: "all",
  referralSource: "all",
};

interface FiltersContextValue {
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  updateFilter: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<GlobalFilters>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.state !== "all") count++;
    if (filters.locationId !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.bundleId !== "all") count++;
    if (filters.payerId !== "all") count++;
    if (filters.referralSource !== "all") count++;
    return count;
  }, [filters]);

  const value = useMemo(
    () => ({ filters, setFilters, updateFilter, resetFilters, activeFilterCount }),
    [filters, activeFilterCount]
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): FiltersContextValue {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used within a FiltersProvider");
  return ctx;
}
