import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { METRIC_DEFINITIONS, MetricDefinition, MetricId } from "@/constants/metricDefinitions";
import { cn } from "@/utils/cn";

const TOOLTIP_WIDTH = 320;
const VIEWPORT_MARGIN = 12;
const HOVER_CLOSE_DELAY = 120;

interface Position {
  top: number;
  left: number;
  /** Whether the panel is flipped above the trigger (vs. its default, below). */
  flippedUp: boolean;
}

/**
 * Contextual metric tooltip. Content is always resolved from the
 * centralized `METRIC_DEFINITIONS` config via `metricId` — no component
 * using this ever needs to hardcode or duplicate explanation copy.
 *
 * Usage: <InfoTooltip metricId="referralSuccessRate" />
 */
export function InfoTooltip({ metricId, className }: { metricId: MetricId; className?: string }) {
  // `METRIC_DEFINITIONS` is checked against `Record<string, MetricDefinition>`
  // via `satisfies`, which validates conformance without widening each
  // entry's inferred type -- so indexing with a generic `MetricId` union
  // otherwise resolves to the union of each entry's own narrower literal
  // shape (missing `calculation` entirely on entries that don't set it,
  // not just `undefined`). The cast is sound: `satisfies` already proved
  // every entry is assignable to `MetricDefinition`.
  const definition = METRIC_DEFINITIONS[metricId] as MetricDefinition;
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useRef(`metric-tooltip-${metricId}-${Math.random().toString(36).slice(2, 8)}`).current;

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const computePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const estimatedHeight = 220; // conservative estimate before first paint

    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN));

    const fitsBelow = rect.bottom + 8 + estimatedHeight <= window.innerHeight - VIEWPORT_MARGIN;
    const flippedUp = !fitsBelow && rect.top - 8 - estimatedHeight >= VIEWPORT_MARGIN;

    const top = flippedUp ? rect.top - 8 : rect.bottom + 8;

    setPosition({ top, left, flippedUp });
  };

  const openTooltip = () => {
    clearCloseTimeout();
    computePosition();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
  };

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) {
      setOpen(false);
    } else {
      openTooltip();
    }
  };

  // Reposition on scroll/resize while open; close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const handleReposition = () => computePosition();
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => () => clearCloseTimeout(), []);

  // Once the panel has actually rendered, refine the flip decision using its
  // real height instead of the rough estimate used for the first paint.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const rect = trigger.getBoundingClientRect();
    const actualHeight = panel.getBoundingClientRect().height;

    const fitsBelow = rect.bottom + 8 + actualHeight <= window.innerHeight - VIEWPORT_MARGIN;
    const flippedUp = !fitsBelow && rect.top - 8 - actualHeight >= VIEWPORT_MARGIN;
    const top = flippedUp ? rect.top - 8 : rect.bottom + 8;

    setPosition((prev) => {
      if (prev && prev.flippedUp === flippedUp && Math.abs(prev.top - top) < 1) return prev;
      let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN));
      return { top, left, flippedUp };
    });
    // Runs once right after the panel mounts for this open session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!definition) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`More info: ${definition.title}`}
        aria-expanded={open}
        aria-describedby={open ? panelId : undefined}
        onMouseEnter={openTooltip}
        onMouseLeave={scheduleClose}
        onClick={toggleTooltip}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full text-foreground-faint transition-colors hover:text-accent-indigo focus-visible:text-accent-indigo",
          className
        )}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && position && (
            <motion.div
              ref={panelRef}
              id={panelId}
              role="tooltip"
              onMouseEnter={clearCloseTimeout}
              onMouseLeave={scheduleClose}
              initial={{ opacity: 0, scale: 0.96, y: position.flippedUp ? 4 : -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: position.flippedUp ? 4 : -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: position.flippedUp ? undefined : position.top,
                bottom: position.flippedUp ? window.innerHeight - position.top : undefined,
                left: position.left,
                width: TOOLTIP_WIDTH,
                zIndex: 100,
              }}
              className="rounded-xl2 border border-border-strong bg-surface p-4 shadow-panel-light backdrop-blur-md dark:shadow-panel"
            >
              <p className="text-sm font-semibold text-foreground">{definition.title}</p>

              <p className="mt-2 text-xs leading-relaxed text-foreground-secondary">{definition.definition}</p>

              <div className="mt-3 border-t border-border pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-quaternary">Why it matters</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground-tertiary">{definition.whyItMatters}</p>
              </div>

              {definition.calculation && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground-quaternary">Calculation</p>
                  <p className="tabular mt-1 text-xs leading-relaxed text-foreground-secondary">{definition.calculation}</p>
                </div>
              )}

              <div className="mt-3 flex items-start gap-1.5 rounded-md bg-accent-indigo/[0.07] px-2.5 py-2">
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-indigo">Tip</span>
                <p className="text-[11px] leading-relaxed text-foreground-secondary">{definition.businessTip}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
