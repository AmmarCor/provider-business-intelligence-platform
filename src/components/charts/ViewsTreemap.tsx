import React from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import { formatNumber } from "@/utils/format";
import { CHART_TILE_GAP } from "./chartTheme";

const PALETTE = ["#5B8DEF", "#3ECF8E", "#8B7CF6", "#F2B75C", "#F2545C", "#4FC3D9", "#E38FD1", "#7FA8F0", "#6FE0B4", "#E3A6E8"];

interface Node {
  name: string;
  size: number;
}

function CustomizedContent(props: any) {
  const { x, y, width, height, index, name, size } = props;
  if (width < 2 || height < 2) return null;
  const showLabel = width > 60 && height > 34;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        style={{
          fill: PALETTE[index % PALETTE.length],
          fillOpacity: 0.85,
          stroke: CHART_TILE_GAP,
          strokeWidth: 2,
        }}
      />
      {showLabel && (
        <>
          <text x={x + 8} y={y + 18} fontSize={11} fontWeight={600} fill="#07080B">
            {name}
          </text>
          <text x={x + 8} y={y + 32} fontSize={10} fill="#07080B" opacity={0.8}>
            {formatNumber(size, { compact: true })} views
          </text>
        </>
      )}
    </g>
  );
}

export function ViewsTreemap({ data, height = 260 }: { data: Node[]; height?: number }) {
  if (data.length === 0) {
    return <p className="text-xs text-foreground-tertiary">No data for the current filters.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap data={data} dataKey="size" stroke={CHART_TILE_GAP} content={<CustomizedContent />}>
        <Tooltip
          formatter={(value: any) => [`${formatNumber(value as number)} views`, ""]}
          contentStyle={{
            background: "rgb(var(--bg-surface))",
            border: "1px solid rgb(var(--border-strong))",
            borderRadius: 8,
            fontSize: 12,
            color: "rgb(var(--fg-primary))",
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
