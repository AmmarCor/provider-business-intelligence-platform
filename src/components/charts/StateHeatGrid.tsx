import React from "react";
import { StateBreakdown, STATE_NAMES } from "@/types";
import { formatNumber } from "@/utils/format";
import { cn } from "@/utils/cn";

/** A compact heat-grid of state performance — avoids requiring a geographic
 *  map dependency while still giving true heat-map semantics (color intensity
 *  encodes magnitude, laid out in a scannable grid). */
export function StateHeatGrid({ data }: { data: StateBreakdown[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {data.map((d) => {
        const intensity = d.value / max;
        return (
          <div
            key={d.state}
            className={cn(
              "flex flex-col items-start justify-between rounded-lg border border-border p-3 transition-transform hover:-translate-y-0.5"
            )}
            style={{
              backgroundColor: `rgba(91, 141, 239, ${0.08 + intensity * 0.32})`,
            }}
          >
            <span className="text-xs font-semibold text-foreground">{d.state}</span>
            <span className="tabular mt-2 text-sm font-semibold text-foreground">
              {formatNumber(d.value, { compact: true })}
            </span>
            <span className="truncate text-[10px] text-foreground-tertiary">{STATE_NAMES[d.state]}</span>
          </div>
        );
      })}
    </div>
  );
}
