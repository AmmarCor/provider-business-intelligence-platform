// Recharts renders these as literal SVG presentation attributes (stroke, fill,
// tick.fill, etc). Modern browsers resolve CSS custom properties inside those
// attributes just like any other CSS value, so referencing the same
// variables the rest of the app uses means every chart re-themes instantly
// when `.dark` is toggled — no JS-side recomputation needed.
export const CHART_GRID = "rgb(var(--chart-grid))";
export const CHART_AXIS = "rgb(var(--chart-axis))";
export const CHART_TICK = "rgb(var(--chart-tick))";
export const CHART_HOVER = "rgb(var(--chart-hover))";
export const CHART_TILE_GAP = "rgb(var(--chart-tile-gap))";
