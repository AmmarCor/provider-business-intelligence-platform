import React from "react";
import { Bundle } from "@/types";
import { formatNumber } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";

export interface RankingRow {
  bundle: Bundle;
  primaryValue: number;
  secondaryValue?: number;
  primaryLabel: string;
  secondaryLabel?: string;
}

export function RankingTable({ rows, emptyMessage }: { rows: RankingRow[]; emptyMessage?: string }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-xs text-foreground-tertiary">{emptyMessage ?? "No bundles match the current filters."}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-foreground-tertiary">
            <th className="py-2 pr-3 font-medium">#</th>
            <th className="py-2 pr-3 font-medium">Bundle</th>
            <th className="py-2 pr-3 font-medium">Category</th>
            <th className="py-2 pr-3 text-right font-medium">Primary</th>
            {rows[0]?.secondaryLabel && <th className="py-2 pl-3 text-right font-medium">Secondary</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.bundle.id} className="border-b border-surface-hover last:border-0 hover:bg-surface-hover/40">
              <td className="py-2.5 pr-3 tabular text-foreground-tertiary">{i + 1}</td>
              <td className="py-2.5 pr-3 font-medium text-foreground">{row.bundle.name}</td>
              <td className="py-2.5 pr-3">
                <Badge tone="info">{row.bundle.category}</Badge>
              </td>
              <td className="py-2.5 pr-3 tabular text-right font-medium text-foreground">
                {formatNumber(row.primaryValue, { compact: true })}
              </td>
              {row.secondaryValue !== undefined && (
                <td className="py-2.5 pl-3 tabular text-right text-foreground-secondary">
                  {formatNumber(row.secondaryValue, { compact: true })}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
