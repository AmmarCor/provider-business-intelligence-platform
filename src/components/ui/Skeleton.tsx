import React from "react";
import { cn } from "@/utils/cn";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("skeleton rounded-lg", className)} style={style} />;
}

export function CardSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="rounded-xl2 border border-border bg-surface/80 p-5">
      <Skeleton className="mb-3 h-4 w-40" />
      <Skeleton className="mb-6 h-3 w-24" />
      <Skeleton style={{ height }} className="w-full" />
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="rounded-xl2 border border-border bg-surface/80 p-5">
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="h-7 w-24" />
    </div>
  );
}
