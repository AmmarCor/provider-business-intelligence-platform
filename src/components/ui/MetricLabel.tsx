import React from "react";
import { InfoTooltip } from "./InfoTooltip";
import { MetricId } from "@/constants/metricDefinitions";
import { cn } from "@/utils/cn";

/**
 * Wraps any label text with its contextual InfoTooltip trigger. `KpiTile`
 * and `CardHeader` use this internally when given a `metricId`; it's also
 * exported for ad hoc use in table headers where a tooltip is appropriate
 * but there's no natural KPI/card title to attach it to.
 */
export function MetricLabel({
  metricId,
  className,
  children,
}: {
  metricId: MetricId;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {children}
      <InfoTooltip metricId={metricId} />
    </span>
  );
}
