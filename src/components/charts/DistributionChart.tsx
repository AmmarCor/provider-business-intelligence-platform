import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_GRID, CHART_HOVER, CHART_TICK, CHART_AXIS } from "./chartTheme";

/** Renders a category price-distribution histogram. The bucket closest to the
 *  provider's own price is highlighted so they can see exactly where they sit
 *  within the aggregated, anonymized market curve. */
export function DistributionChart({
  buckets,
  providerBucketIndex,
  height = 240,
}: {
  buckets: { label: string; count: number }[];
  providerBucketIndex: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={buckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: CHART_TICK, fontSize: 10 }} axisLine={{ stroke: CHART_AXIS }} tickLine={false} />
        <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<ChartTooltip formatter={(v: number) => `${v} similar bundles`} />} cursor={{ fill: CHART_HOVER }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {buckets.map((_, i) => (
            <Cell key={i} fill={i === providerBucketIndex ? "#5B8DEF" : "rgb(var(--border-strong))"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
