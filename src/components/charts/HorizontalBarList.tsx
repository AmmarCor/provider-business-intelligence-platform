import React from "react";
import { formatNumber } from "@/utils/format";

interface Item {
  label: string;
  value: number;
  sublabel?: string;
}

export function HorizontalBarList({
  items,
  color = "#5B8DEF",
  valueFormatter,
  maxItems = 8,
}: {
  items: Item[];
  color?: string;
  valueFormatter?: (v: number) => string;
  maxItems?: number;
}) {
  const shown = items.slice(0, maxItems);
  const max = Math.max(...shown.map((i) => i.value), 1);
  const format = valueFormatter ?? ((v: number) => formatNumber(v, { compact: true }));

  return (
    <div className="flex flex-col gap-3">
      {shown.map((item, i) => (
        <div key={item.label + i}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="truncate pr-2 text-foreground-secondary">{item.label}</span>
            <span className="tabular shrink-0 font-medium text-foreground">{format(item.value)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          {item.sublabel && <p className="mt-0.5 text-[11px] text-foreground-tertiary">{item.sublabel}</p>}
        </div>
      ))}
      {shown.length === 0 && <p className="text-xs text-foreground-tertiary">No data for the current filters.</p>}
    </div>
  );
}
