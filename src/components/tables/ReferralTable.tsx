import React, { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Referral, REFERRAL_SOURCE_LABELS } from "@/types";
import { formatDateShort, daysAgo } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { bundleById } from "@/utils/analytics";

const STATUS_TONE: Record<Referral["status"], "positive" | "warning" | "critical" | "neutral" | "info"> = {
  new: "info",
  in_review: "neutral",
  scheduled: "warning",
  completed: "positive",
  cancelled: "critical",
};

const STATUS_LABEL: Record<Referral["status"], string> = {
  new: "New",
  in_review: "In review",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ReferralTable({ referrals }: { referrals: Referral[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);

  const columns = useMemo<ColumnDef<Referral>[]>(
    () => [
      {
        header: "Bundle",
        accessorFn: (r) => bundleById.get(r.bundleId)?.name ?? "Unknown bundle",
        id: "bundleName",
        cell: (info) => <span className="font-medium text-foreground">{info.getValue() as string}</span>,
      },
      {
        header: "Payer",
        accessorKey: "payerName",
        cell: (info) => <span className="text-foreground-secondary">{info.getValue() as string}</span>,
      },
      {
        header: "State",
        accessorKey: "state",
      },
      {
        header: "Source",
        accessorKey: "source",
        cell: (info) => (
          <span className="text-foreground-secondary">{REFERRAL_SOURCE_LABELS[info.getValue() as Referral["source"]]}</span>
        ),
      },
      {
        header: "Created",
        accessorKey: "createdAt",
        cell: (info) => <span className="tabular">{formatDateShort(info.getValue() as string)}</span>,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const status = info.getValue() as Referral["status"];
          return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
        },
      },
      {
        header: "Invoices",
        accessorKey: "invoiceCount",
        cell: (info) => <span className="tabular">{info.getValue() as number}</span>,
      },
      {
        header: "Last activity",
        accessorKey: "lastActivityAt",
        cell: (info) => {
          const value = info.getValue() as string;
          const age = daysAgo(value);
          return (
            <span className={age > 21 ? "text-accent-amber" : "text-foreground-secondary"}>
              {age === 0 ? "Today" : `${age}d ago`}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: referrals,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (referrals.length === 0) {
    return <p className="py-6 text-center text-xs text-foreground-tertiary">No referrals match the current filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border text-[11px] uppercase tracking-wide text-foreground-tertiary">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="cursor-pointer select-none py-2 pr-3 font-medium"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="inline-flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : header.column.getIsSorted() === "desc" ? (
                      <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.slice(0, 25).map((row) => (
            <tr key={row.id} className="border-b border-surface-hover last:border-0 hover:bg-surface-hover/40">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-2.5 pr-3 tabular">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {referrals.length > 25 && (
        <p className="mt-2 text-center text-[11px] text-foreground-tertiary">
          Showing 25 of {referrals.length} referrals for the current filters.
        </p>
      )}
    </div>
  );
}
