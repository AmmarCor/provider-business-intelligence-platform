import React from "react";
import { BundleUsageRow } from "@/types";
import { formatNumber } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";

export function BundleUsageTable({ rows, emptyMessage }: { rows: BundleUsageRow[]; emptyMessage?: string }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-xs text-foreground-tertiary">{emptyMessage ?? "No transaction activity for the current filters."}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-foreground-tertiary">
            <th className="py-2 pr-3 font-medium">Bundle</th>
            <th className="py-2 pr-3 font-medium">Category</th>
            <th className="py-2 pr-3 font-medium">Origin</th>
            <th className="py-2 pr-3 text-right font-medium">Invoices</th>
            <th className="py-2 pl-3 text-right font-medium">Vouchers</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.bundleId ?? row.bundleName}-${i}`} className="border-b border-surface-hover last:border-0 hover:bg-surface-hover/40">
              <td className="py-2.5 pr-3 font-medium text-foreground">{row.bundleName}</td>
              <td className="py-2.5 pr-3">
                <Badge tone="info">{row.category}</Badge>
              </td>
              <td className="py-2.5 pr-3">
                <Badge tone={row.source === "marketplace" ? "neutral" : "warning"}>
                  {row.source === "marketplace" ? "Marketplace" : "Manual"}
                </Badge>
              </td>
              <td className="py-2.5 pr-3 tabular text-right font-medium text-foreground">{formatNumber(row.invoiceCount)}</td>
              <td className="py-2.5 pl-3 tabular text-right text-foreground-secondary">{formatNumber(row.voucherCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
