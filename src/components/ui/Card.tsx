import React from "react";
import { cn } from "@/utils/cn";
import { InfoTooltip } from "./InfoTooltip";
import { MetricId } from "@/constants/metricDefinitions";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padded?: boolean;
}

export function Card({ children, className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-border bg-surface/80 shadow-panel-light backdrop-blur-sm dark:shadow-panel",
        padded && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  metricId,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Optional — when provided, shows a contextual info tooltip beside the title. */
  metricId?: MetricId;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {title}
          {metricId && <InfoTooltip metricId={metricId} />}
        </h3>
        {subtitle && <p className="mt-0.5 text-xs text-foreground-tertiary">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
