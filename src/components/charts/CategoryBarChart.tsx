import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { formatNumber } from "@/utils/format";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_GRID, CHART_HOVER, CHART_TICK } from "./chartTheme";

const PALETTE = ["#5B8DEF", "#3ECF8E", "#8B7CF6", "#F2B75C", "#F2545C", "#4FC3D9", "#E38FD1", "#C4C9D4", "#7FA8F0", "#6FE0B4"];

export function CategoryBarChart({
  data,
  height = 260,
}: {
  data: { category: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: CHART_TICK, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatNumber(v, { compact: true })}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: "rgb(var(--fg-secondary))", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip content={<ChartTooltip formatter={(v: number) => formatNumber(v)} />} cursor={{ fill: CHART_HOVER }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
