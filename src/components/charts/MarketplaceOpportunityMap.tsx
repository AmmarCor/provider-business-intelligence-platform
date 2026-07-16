import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/format";
import {
  MapPricePosition,
  OpportunityLevel,
  OpportunityMapEntry,
  OPPORTUNITY_MAP_DATA,
  OPPORTUNITY_MAP_BY_CODE,
} from "@/data/opportunityMapData";
import { US_STATE_PATHS, US_MAP_VIEWBOX, DC_MARKER } from "@/data/usStatesGeo";
import { cn } from "@/utils/cn";

const LEVEL_FILL_CLASSES: Record<OpportunityLevel, string> = {
  high: "fill-accent-teal/30 stroke-border-strong hover:fill-accent-teal/50 hover:stroke-accent-teal focus-visible:fill-accent-teal/50 focus-visible:stroke-accent-teal",
  medium: "fill-accent-amber/30 stroke-border-strong hover:fill-accent-amber/50 hover:stroke-accent-amber focus-visible:fill-accent-amber/50 focus-visible:stroke-accent-amber",
  low: "fill-accent-rose/30 stroke-border-strong hover:fill-accent-rose/50 hover:stroke-accent-rose focus-visible:fill-accent-rose/50 focus-visible:stroke-accent-rose",
  "no-data": "fill-border/30 stroke-border-strong hover:fill-border/50 hover:stroke-foreground-faint focus-visible:fill-border/50 focus-visible:stroke-foreground-faint",
};

/** Used for the small colored pill badge inside the tooltip (not the map itself). */
const LEVEL_TILE_CLASSES: Record<OpportunityLevel, string> = {
  high: "bg-accent-teal/25 border-accent-teal/50 hover:bg-accent-teal/35 text-foreground",
  medium: "bg-accent-amber/25 border-accent-amber/50 hover:bg-accent-amber/35 text-foreground",
  low: "bg-accent-rose/25 border-accent-rose/50 hover:bg-accent-rose/35 text-foreground",
  "no-data": "bg-border/30 border-border hover:bg-border/50 text-foreground-quaternary",
};

const LEVEL_DOT_CLASSES: Record<OpportunityLevel, string> = {
  high: "bg-accent-teal",
  medium: "bg-accent-amber",
  low: "bg-accent-rose",
  "no-data": "bg-foreground-faint",
};

const LEVEL_LABELS: Record<OpportunityLevel, string> = {
  high: "High Opportunity",
  medium: "Medium Opportunity",
  low: "Low Opportunity",
  "no-data": "No Data",
};

const PRICE_POSITION_LABELS: Record<MapPricePosition, string> = {
  below: "Below market",
  aligned: "Aligned with market",
  above: "Above market",
  significantly_above: "Significantly above market",
};

// ---------------------------------------------------------------------------
// Tooltip sizing / positioning
// ---------------------------------------------------------------------------

const TOOLTIP_WIDTH = 280;
const TOOLTIP_MAX_WIDTH = 300;
const VIEWPORT_MARGIN = 16;
const CURSOR_OFFSET = 12;
const DEFAULT_TOOLTIP_HEIGHT = 320; // corrected pre-paint once the real height is measured

interface TooltipPosition {
  top: number;
  left: number;
}

/**
 * Smart edge-aware placement with independent horizontal and vertical flip
 * detection -- the two axes are evaluated separately, so a tooltip that
 * fits fine horizontally but is near the bottom edge still flips upward
 * (rather than only flipping when horizontal placement fails, which could
 * leave it clipped vertically). A final unconditional clamp guarantees no
 * overflow regardless of which branch fired. Sizing math uses the
 * tooltip's *maximum* possible width, not its nominal width, so a
 * slightly wider render (content-dependent, up to TOOLTIP_MAX_WIDTH) can
 * never push it past the edge. Works identically whether the anchor is a
 * live cursor position or a focused element's bounding box.
 */
function computeTooltipPosition(anchorX: number, anchorY: number, height: number): TooltipPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = TOOLTIP_MAX_WIDTH;

  // Horizontal: default to the right of the anchor; flip left if that
  // would run past the right edge.
  const fitsRight = anchorX + CURSOR_OFFSET + width <= vw - VIEWPORT_MARGIN;
  const leftCandidate = anchorX - CURSOR_OFFSET - width;
  const fitsLeft = leftCandidate >= VIEWPORT_MARGIN;
  let left: number;
  if (fitsRight) {
    left = anchorX + CURSOR_OFFSET;
  } else if (fitsLeft) {
    left = leftCandidate;
  } else {
    left = anchorX - width / 2; // neither side fully fits (narrow viewport) -- center as a last resort
  }

  // Vertical: default below the anchor; flip above if that would run past
  // the bottom edge. Evaluated independently of the horizontal decision.
  const fitsBelow = anchorY + CURSOR_OFFSET + height <= vh - VIEWPORT_MARGIN;
  const aboveCandidate = anchorY - CURSOR_OFFSET - height;
  const fitsAbove = aboveCandidate >= VIEWPORT_MARGIN;
  let top: number;
  if (fitsBelow) {
    top = anchorY + CURSOR_OFFSET;
  } else if (fitsAbove) {
    top = aboveCandidate;
  } else {
    top = anchorY + CURSOR_OFFSET; // neither fully fits (very short viewport) -- the clamp below still protects it
  }

  // Unconditional safety clamp -- guarantees no overflow no matter which
  // branch above was taken, and keeps the required edge margin everywhere.
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - width - VIEWPORT_MARGIN));
  top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - height - VIEWPORT_MARGIN));

  return { top, left };
}

/**
 * A small, always-visible explainer — not a hover tooltip — so a first-time
 * viewer immediately understands what the score means, roughly how it's
 * built, and what decision it's meant to drive, before they ever hover a
 * state. Mirrors the app's existing "callout box" styling (same treatment
 * as the sidebar's Insights engine note and the Insight card's Tip box).
 */
function OpportunityScoreExplainer() {
  return (
    <div className="mb-5 rounded-xl2 border border-border bg-surface-hover/50 p-4">
      <div className="flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-accent-indigo" />
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-secondary">
          How to read this map
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-quaternary">What it is</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground-tertiary">
            A single 0–100 score per state estimating how much upside is left to capture there — not just how much
            activity already exists.
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-quaternary">How it's calculated</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground-tertiary">
            A weighted blend of Marketplace Views, Referral Requests, Referrals with Invoices, Competition Level, and
            Relative Pricing for that state.
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-quaternary">What to do with it</p>
          <p className="mt-1 text-xs leading-relaxed text-foreground-tertiary">
            Prioritize green states for expansion first, then act on the Recommended Action shown when you hover a
            state.
          </p>
        </div>
      </div>
    </div>
  );
}

export function MarketplaceOpportunityMap() {
  const [hoveredEntry, setHoveredEntry] = useState<OpportunityMapEntry | null>(null);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipHeightRef = useRef<number>(DEFAULT_TOOLTIP_HEIGHT);
  const lastAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const pendingAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const isKeyboardInteractionRef = useRef(false);

  const activeCode = hoveredEntry?.code ?? null;

  const applyPosition = useCallback((x: number, y: number) => {
    lastAnchorRef.current = { x, y };
    setPosition(computeTooltipPosition(x, y, tooltipHeightRef.current));
  }, []);

  // Discrete events (hover-enter, focus, click) get an immediate, unthrottled
  // position -- there's exactly one of these per interaction, so there's no
  // performance reason to defer it, and doing it synchronously means the
  // tooltip never has to "catch up" after appearing.
  const showAt = useCallback(
    (entry: OpportunityMapEntry, x: number, y: number) => {
      setHoveredEntry(entry);
      applyPosition(x, y);
    },
    [applyPosition]
  );

  const handlePointerEnter = useCallback(
    (entry: OpportunityMapEntry, e: React.MouseEvent<SVGElement>) => {
      isKeyboardInteractionRef.current = false;
      showAt(entry, e.clientX, e.clientY);
    },
    [showAt]
  );

  // Continuous cursor-follow while hovering, throttled to at most once per
  // animation frame so rapid mousemove events can never queue up more
  // renders than the screen can actually show.
  const handlePointerMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!hoveredEntry || isKeyboardInteractionRef.current) return;
      pendingAnchorRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const anchor = pendingAnchorRef.current;
        if (anchor) applyPosition(anchor.x, anchor.y);
      });
    },
    [hoveredEntry, applyPosition]
  );

  const handleFocus = useCallback(
    (entry: OpportunityMapEntry, e: React.FocusEvent<SVGElement>) => {
      isKeyboardInteractionRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      showAt(entry, rect.right, rect.top + rect.height / 2);
    },
    [showAt]
  );

  const hideTooltip = useCallback(() => {
    setHoveredEntry(null);
    setPosition(null);
    lastAnchorRef.current = null;
    pendingAnchorRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGElement>, entry: OpportunityMapEntry) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        isKeyboardInteractionRef.current = true;
        const rect = e.currentTarget.getBoundingClientRect();
        showAt(entry, rect.right, rect.top + rect.height / 2);
      } else if (e.key === "Escape") {
        hideTooltip();
      }
    },
    [showAt, hideTooltip]
  );

  // Once the tooltip has actually rendered for a given state, correct its
  // position using the real measured height (content length varies -- a
  // "no data" state is much shorter than a fully-scored one). This runs
  // pre-paint, so the user never sees the intermediate estimate-based
  // position; it only re-runs when the displayed state changes, not on
  // every mousemove.
  useLayoutEffect(() => {
    if (!hoveredEntry || !tooltipRef.current) return;
    const measured = tooltipRef.current.getBoundingClientRect().height;
    if (measured > 0 && Math.abs(measured - tooltipHeightRef.current) > 1) {
      tooltipHeightRef.current = measured;
      const anchor = lastAnchorRef.current;
      if (anchor) {
        setPosition(computeTooltipPosition(anchor.x, anchor.y, measured));
      }
    }
  }, [hoveredEntry]);

  const dcEntry = OPPORTUNITY_MAP_BY_CODE.get("DC");

  const stateInteractionClasses =
    "cursor-pointer outline-none transition-all duration-200 hover:brightness-110 hover:drop-shadow-lg focus-visible:brightness-110 focus-visible:drop-shadow-lg";

  return (
    <Card className="relative">
      <CardHeader
        title="Marketplace Opportunity Map"
        subtitle="Identify geographic markets with the greatest opportunity to grow referrals and improve pricing competitiveness."
      />

      <OpportunityScoreExplainer />

      <div className="flex flex-col gap-5">
        <svg
          viewBox={`0 0 ${US_MAP_VIEWBOX.width} ${US_MAP_VIEWBOX.height}`}
          className="h-auto w-full"
          role="group"
          aria-label="Map of US states colored by marketplace opportunity level"
          onMouseMove={handlePointerMove}
          onMouseLeave={hideTooltip}
        >
          {OPPORTUNITY_MAP_DATA.filter((entry) => entry.code !== "DC").map((entry) => {
            const d = US_STATE_PATHS[entry.code];
            if (!d) return null;
            return (
              <path
                key={entry.code}
                d={d}
                tabIndex={0}
                role="button"
                aria-label={`${entry.name}: ${LEVEL_LABELS[entry.level]}${
                  entry.opportunityScore !== undefined ? `, opportunity score ${entry.opportunityScore} of 100` : ""
                }`}
                onMouseEnter={(e) => handlePointerEnter(entry, e)}
                onFocus={(e) => handleFocus(entry, e)}
                onClick={(e) => handlePointerEnter(entry, e)}
                onKeyDown={(e) => handleKeyDown(e, entry)}
                onBlur={hideTooltip}
                strokeWidth={activeCode === entry.code ? 2 : 1}
                className={cn(stateInteractionClasses, LEVEL_FILL_CLASSES[entry.level])}
              />
            );
          })}

          {dcEntry && (
            <circle
              cx={DC_MARKER.x}
              cy={DC_MARKER.y}
              r={DC_MARKER.r}
              tabIndex={0}
              role="button"
              aria-label={`${dcEntry.name}: ${LEVEL_LABELS[dcEntry.level]}`}
              onMouseEnter={(e) => handlePointerEnter(dcEntry, e)}
              onFocus={(e) => handleFocus(dcEntry, e)}
              onClick={(e) => handlePointerEnter(dcEntry, e)}
              onKeyDown={(e) => handleKeyDown(e, dcEntry)}
              onBlur={hideTooltip}
              strokeWidth={activeCode === "DC" ? 2 : 1}
              className={cn(stateInteractionClasses, LEVEL_FILL_CLASSES[dcEntry.level])}
            />
          )}
        </svg>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
          {(["high", "medium", "low", "no-data"] as OpportunityLevel[]).map((level) => (
            <div key={level} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-full", LEVEL_DOT_CLASSES[level])} />
              <span className="text-xs text-foreground-tertiary">{LEVEL_LABELS[level]}</span>
            </div>
          ))}
        </div>
      </div>

      {hoveredEntry &&
        position &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={() => {}}
            onMouseLeave={hideTooltip}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: TOOLTIP_WIDTH,
              maxWidth: TOOLTIP_MAX_WIDTH,
              zIndex: 100,
              transition: "top 120ms ease-out, left 120ms ease-out",
            }}
            className="animate-fadeUp rounded-xl2 border border-border-strong bg-surface p-4 shadow-panel-light backdrop-blur-md dark:shadow-panel"
          >
            <StateTooltipContent entry={hoveredEntry} />
          </div>,
          document.body
        )}
    </Card>
  );
}

function StateTooltipContent({ entry }: { entry: OpportunityMapEntry }) {
  if (entry.level === "no-data" || entry.opportunityScore === undefined) {
    return (
      <div>
        <p className="text-sm font-semibold text-foreground">{entry.name}</p>
        <p className="mt-2 text-xs leading-relaxed text-foreground-tertiary">
          No marketplace activity in {entry.name} yet — no bundles are currently published in this state.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{entry.name}</p>
        <span className={cn("flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium", LEVEL_TILE_CLASSES[entry.level])}>
          <span className={cn("h-1.5 w-1.5 rounded-full", LEVEL_DOT_CLASSES[entry.level])} />
          {LEVEL_LABELS[entry.level]}
        </span>
      </div>

      <p className="tabular mt-2 text-xs text-foreground-secondary">
        Opportunity Score: <span className="font-semibold text-foreground">{entry.opportunityScore} / 100</span>
      </p>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-3 text-xs">
        <TooltipStat label="Marketplace Views" value={formatNumber(entry.marketplaceViews ?? 0, { compact: true })} />
        <TooltipStat label="Referral Requests" value={formatNumber(entry.referralRequests ?? 0)} />
        <TooltipStat label="Referrals with Invoices" value={formatPercent(entry.referralSuccessRate ?? 0)} />
        <TooltipStat label="Competition" value={entry.competitionLevel ?? "—"} />
        <TooltipStat label="Avg. Market Price" value={formatCurrency(entry.avgMarketPrice ?? 0, { compact: true })} />
        <TooltipStat label="Your Avg. Price" value={formatCurrency(entry.yourAvgPrice ?? 0, { compact: true })} />
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-quaternary">Price Position</p>
        <p className="mt-1 text-xs text-foreground-secondary">
          {entry.pricePosition ? PRICE_POSITION_LABELS[entry.pricePosition] : "—"}
        </p>
      </div>

      {entry.topCategories && entry.topCategories.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-quaternary">Top Bundle Categories</p>
          <p className="mt-1 text-xs text-foreground-secondary">{entry.topCategories.join(", ")}</p>
        </div>
      )}

      {entry.recommendedAction && (
        <div className="mt-3 flex items-start gap-1.5 rounded-md bg-accent-indigo/[0.07] px-2.5 py-2">
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-indigo">Action</span>
          <p className="text-[11px] leading-relaxed text-foreground-secondary">{entry.recommendedAction}</p>
        </div>
      )}
    </div>
  );
}

function TooltipStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-foreground-quaternary">{label}</p>
      <p className="tabular font-medium text-foreground-secondary">{value}</p>
    </div>
  );
}
