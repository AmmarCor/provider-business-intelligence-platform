import React from "react";
import { AlertTriangle, CheckCircle2, Info, Lightbulb, XCircle } from "lucide-react";
import { Insight, INSIGHT_CATEGORY_LABELS } from "@/types";
import { cn } from "@/utils/cn";
import { Badge } from "./Badge";

const TONE_STYLES: Record<Insight["tone"], { border: string; icon: React.ReactNode; iconColor: string }> = {
  positive: { border: "border-l-accent-teal", icon: <CheckCircle2 className="h-4 w-4" />, iconColor: "text-accent-teal" },
  warning: { border: "border-l-accent-amber", icon: <AlertTriangle className="h-4 w-4" />, iconColor: "text-accent-amber" },
  critical: { border: "border-l-accent-rose", icon: <XCircle className="h-4 w-4" />, iconColor: "text-accent-rose" },
  neutral: { border: "border-l-accent-indigo", icon: <Info className="h-4 w-4" />, iconColor: "text-accent-indigo" },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const style = TONE_STYLES[insight.tone];
  return (
    <div
      className={cn(
        "rounded-lg border border-border border-l-[3px] bg-surface-hover/50 p-4 transition-colors hover:bg-surface-hover",
        style.border
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className={cn("mt-0.5 shrink-0", style.iconColor)}>{style.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{insight.title}</p>
            {insight.category && <Badge tone="neutral">{INSIGHT_CATEGORY_LABELS[insight.category]}</Badge>}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-foreground-tertiary">{insight.body}</p>
          {insight.action && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md bg-border/40 px-2.5 py-1.5">
              <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-accent-amber" />
              <p className="text-[11px] font-medium leading-relaxed text-foreground-secondary">{insight.action}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InsightsPanel({ insights, title = "Insights" }: { insights: Insight[]; title?: string }) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-border-strong p-6 text-center">
        <p className="text-sm text-foreground-tertiary">No notable signals for the current filters — performance looks stable.</p>
      </div>
    );
  }
  return (
    <div>
      {title && (
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-gradient" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
