import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendPoint } from "@/types";
import { formatDateShort } from "@/utils/format";
import { formatNumber } from "@/utils/format";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_AXIS, CHART_GRID, CHART_TICK } from "./chartTheme";

export function AreaTrendChart({
  data,
  color = "#5B8DEF",
  height = 260,
  valueLabel = "Value",
}: {
  data: TrendPoint[];
  color?: string;
  height?: number;
  valueLabel?: string;
}) {
  const gradientId = `trendGradient-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          tick={{ fill: CHART_TICK, fontSize: 11 }}
          axisLine={{ stroke: CHART_AXIS }}
          tickLine={false}
          minTickGap={32}
        />
        <YAxis
          tick={{ fill: CHART_TICK, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatNumber(v, { compact: true })}
          width={40}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v: number) => `${valueLabel}: ${formatNumber(v)}`} />}
          labelFormatter={(l) => formatDateShort(l as string)}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
