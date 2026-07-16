import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/utils/cn";
import { InfoTooltip } from "./InfoTooltip";
import { MetricId } from "@/constants/metricDefinitions";

interface KpiTileProps {
  label: string;
  value: string;
  delta?: number; // fractional, e.g. 0.12 = +12%
  deltaLabel?: string;
  icon?: React.ReactNode;
  invertDelta?: boolean; // when a negative delta is actually good (e.g. stale referrals down)
  /** Optional — when provided, shows a contextual info tooltip beside the label. */
  metricId?: MetricId;
}

export function KpiTile({ label, value, delta, deltaLabel, icon, invertDelta, metricId }: KpiTileProps) {
  const isFlat = delta === undefined || Math.abs(delta) < 0.001;
  const isPositive = delta !== undefined && (invertDelta ? delta < 0 : delta > 0);

  return (
    <div className="group rounded-xl2 border border-border bg-surface/80 p-5 shadow-panel-light backdrop-blur-sm transition-all duration-200 hover:border-border-strong hover:shadow-glow animate-fadeUp dark:shadow-panel">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-foreground-tertiary">
          {label}
          {metricId && <InfoTooltip metricId={metricId} />}
        </span>
        {icon && <span className="text-foreground-tertiary transition-colors group-hover:text-accent-indigo">{icon}</span>}
      </div>
      <div className="mt-2 tabular text-2xl font-semibold text-foreground">{value}</div>
      {delta !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          {isFlat ? (
            <Minus className="h-3.5 w-3.5 text-foreground-tertiary" />
          ) : isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-accent-teal" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-accent-rose" />
          )}
          <span className={cn("tabular font-medium", isFlat ? "text-foreground-tertiary" : isPositive ? "text-accent-teal" : "text-accent-rose")}>
            {Math.abs(delta * 100).toFixed(1)}%
          </span>
          {deltaLabel && <span className="text-foreground-tertiary">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
