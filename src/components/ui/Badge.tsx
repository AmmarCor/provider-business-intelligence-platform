import React from "react";
import { cn } from "@/utils/cn";

type BadgeTone = "positive" | "warning" | "critical" | "neutral" | "info";

const TONE_CLASSES: Record<BadgeTone, string> = {
  positive: "bg-accent-teal/10 text-accent-teal border-accent-teal/25",
  warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/25",
  critical: "bg-accent-rose/10 text-accent-rose border-accent-rose/25",
  neutral: "bg-border/50 text-foreground-tertiary border-border-strong/50",
  info: "bg-accent-indigo/10 text-accent-indigo border-accent-indigo/25",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
