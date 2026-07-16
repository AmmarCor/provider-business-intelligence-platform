import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatNumber } from "@/utils/format";
import { CHART_TILE_GAP } from "./chartTheme";

/**
 * Hand-written squarified treemap -- no charting library involved for this
 * component. Recharts' <Treemap> (still used nowhere else needed replacing)
 * doesn't reliably suppress its own default label styling when a custom
 * cell `content` renderer is used, which is what caused the stroke/shadow
 * artifact on labels no matter how the text elements themselves were
 * styled. Writing every SVG attribute directly removes that library layer
 * entirely, at zero new dependencies -- appropriate here since the data is
 * a flat {name, size}[] list with no real hierarchy, so a general-purpose
 * hierarchy library (visx/nivo/d3-hierarchy) would be solving a more
 * general problem than this chart actually has.
 */

const PALETTE = ["#5B8DEF", "#3ECF8E", "#8B7CF6", "#F2B75C", "#F2545C", "#4FC3D9", "#E38FD1", "#7FA8F0", "#6FE0B4", "#E3A6E8"];

interface Node {
  name: string;
  size: number;
}

interface LayoutRect extends Node {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Standard squarified treemap algorithm (Bruls, Huizing, van Wijk 2000).
 *  `items` must already be sorted descending by size. */
function squarify(items: Node[], x: number, y: number, width: number, height: number): LayoutRect[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ ...items[0], x, y, width, height }];
  }

  const total = items.reduce((sum, item) => sum + item.size, 0);
  const area = width * height;
  const isWide = width >= height;
  const shortSide = isWide ? height : width;

  const worstRatio = (rowItems: Node[], rowLength: number): number => {
    let worst = 0;
    for (const item of rowItems) {
      const itemArea = total > 0 ? (item.size / total) * area : 0;
      const itemShort = rowLength > 0 ? itemArea / rowLength : 0;
      const ratio = itemShort > 0 ? Math.max(rowLength / itemShort, itemShort / rowLength) : Infinity;
      worst = Math.max(worst, ratio);
    }
    return worst;
  };

  let bestSplit = 1;
  let bestWorst = Infinity;
  for (let i = 1; i <= items.length; i++) {
    const rowItems = items.slice(0, i);
    const rowSize = rowItems.reduce((sum, item) => sum + item.size, 0);
    const rowArea = total > 0 ? (rowSize / total) * area : 0;
    const rowLength = shortSide > 0 ? rowArea / shortSide : 0;
    const w = worstRatio(rowItems, rowLength);
    if (w <= bestWorst) {
      bestWorst = w;
      bestSplit = i;
    } else {
      break;
    }
  }

  const rowItems = items.slice(0, bestSplit);
  const restItems = items.slice(bestSplit);
  const rowSize = rowItems.reduce((sum, item) => sum + item.size, 0);
  const rowFraction = total > 0 ? rowSize / total : 0;

  const results: LayoutRect[] = [];
  if (isWide) {
    const rowWidth = width * rowFraction;
    let cy = y;
    for (const item of rowItems) {
      const itemFraction = rowSize > 0 ? item.size / rowSize : 0;
      const itemHeight = height * itemFraction;
      results.push({ ...item, x, y: cy, width: rowWidth, height: itemHeight });
      cy += itemHeight;
    }
    if (restItems.length > 0) {
      results.push(...squarify(restItems, x + rowWidth, y, width - rowWidth, height));
    }
  } else {
    const rowHeight = height * rowFraction;
    let cx = x;
    for (const item of rowItems) {
      const itemFraction = rowSize > 0 ? item.size / rowSize : 0;
      const itemWidth = width * itemFraction;
      results.push({ ...item, x: cx, y, width: itemWidth, height: rowHeight });
      cx += itemWidth;
    }
    if (restItems.length > 0) {
      results.push(...squarify(restItems, x, y + rowHeight, width, height - rowHeight));
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Tooltip -- portaled to document.body so `position: fixed` is guaranteed
// relative to the true viewport rather than any transformed ancestor
// (the same fix applied to the Marketplace Opportunity Map's tooltip).
// ---------------------------------------------------------------------------

const TOOLTIP_WIDTH = 200;
const TOOLTIP_HEIGHT_ESTIMATE = 76;
const VIEWPORT_MARGIN = 12;
const CURSOR_OFFSET = 14;

function computeTooltipPosition(anchorX: number, anchorY: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const fitsRight = anchorX + CURSOR_OFFSET + TOOLTIP_WIDTH <= vw - VIEWPORT_MARGIN;
  const leftCandidate = anchorX - CURSOR_OFFSET - TOOLTIP_WIDTH;
  const fitsLeft = leftCandidate >= VIEWPORT_MARGIN;
  let left = fitsRight ? anchorX + CURSOR_OFFSET : fitsLeft ? leftCandidate : anchorX - TOOLTIP_WIDTH / 2;

  const fitsBelow = anchorY + CURSOR_OFFSET + TOOLTIP_HEIGHT_ESTIMATE <= vh - VIEWPORT_MARGIN;
  const aboveCandidate = anchorY - CURSOR_OFFSET - TOOLTIP_HEIGHT_ESTIMATE;
  const fitsAbove = aboveCandidate >= VIEWPORT_MARGIN;
  let top = fitsBelow ? anchorY + CURSOR_OFFSET : fitsAbove ? aboveCandidate : anchorY + CURSOR_OFFSET;

  left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - TOOLTIP_WIDTH - VIEWPORT_MARGIN));
  top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - TOOLTIP_HEIGHT_ESTIMATE - VIEWPORT_MARGIN));
  return { top, left };
}

export function ViewsTreemap({ data, height = 260 }: { data: Node[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hovered, setHovered] = useState<LayoutRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (data.length === 0) {
    return <p className="text-xs text-foreground-tertiary">No data for the current filters.</p>;
  }

  const sorted = [...data].sort((a, b) => b.size - a.size);
  const totalSize = sorted.reduce((sum, node) => sum + node.size, 0);
  const layout = containerWidth > 0 ? squarify(sorted, 0, 0, containerWidth, height) : [];

  const showTooltip = (rect: LayoutRect, clientX: number, clientY: number) => {
    setHovered(rect);
    setTooltipPos(computeTooltipPosition(clientX, clientY));
  };
  const hideTooltip = () => {
    setHovered(null);
    setTooltipPos(null);
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <svg width={containerWidth} height={height} onMouseLeave={hideTooltip}>
        {layout.map((rect, i) => {
          const showLabel = rect.width > 60 && rect.height > 34;
          return (
            <g
              key={rect.name}
              onMouseEnter={(e) => showTooltip(rect, e.clientX, e.clientY)}
              onMouseMove={(e) => showTooltip(rect, e.clientX, e.clientY)}
              className="cursor-pointer"
            >
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                rx={6}
                fill={PALETTE[i % PALETTE.length]}
                fillOpacity={0.85}
                stroke={CHART_TILE_GAP}
                strokeWidth={2}
              />
              {showLabel && (
                <>
                  <text
                    x={rect.x + 8}
                    y={rect.y + 18}
                    fontSize={11}
                    fontWeight={600}
                    fontFamily="Inter, system-ui, sans-serif"
                    fill="#07080B"
                  >
                    {rect.name}
                  </text>
                  <text
                    x={rect.x + 8}
                    y={rect.y + 32}
                    fontSize={10}
                    fontFamily="Inter, system-ui, sans-serif"
                    fill="#07080B"
                    opacity={0.8}
                  >
                    {formatNumber(rect.size, { compact: true })} views
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {hovered &&
        tooltipPos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: TOOLTIP_WIDTH,
              zIndex: 100,
            }}
            className="animate-fadeUp rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs shadow-panel-light dark:shadow-panel"
          >
            <p className="mb-1 font-medium text-foreground">{hovered.name}</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-indigo" />
              <span className="tabular text-foreground-secondary">{formatNumber(hovered.size)} views</span>
            </div>
            <p className="mt-1 text-[11px] text-foreground-tertiary">
              {totalSize > 0 ? ((hovered.size / totalSize) * 100).toFixed(1) : "0.0"}% of views shown in this chart
            </p>
          </div>,
          document.body
        )}
    </div>
  );
}
