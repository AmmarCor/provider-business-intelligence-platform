# Provider Business Intelligence Platform

**Provider Business Intelligence Platform** combines Marketplace, Operational, Bundle, Pricing, and Referral intelligence with a cross-cutting Performance Insights section, so a provider can answer:

1. **Am I visible?** — Visibility Intelligence
2. **Are payers interested?** — Demand Intelligence
3. **How competitive are my prices?** — Pricing Intelligence
4. **Are payers choosing me?** — Referral Intelligence
5. **How is my business running?** — Operational Intelligence *(referral sources, aging, invoice/voucher throughput)*
6. **What am I actually delivering?** — Bundle Intelligence *(Marketplace catalog vs. real transaction usage)*
7. **What should I do next?** — Performance Insights *(the flagship, cross-module answer)*

The app opens on an **Executive Overview** landing page introducing the platform (`/`); clicking **Explore Platform** enters the full dashboard at `/dashboard`.

## Running the app

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (defaults to `http://localhost:5173`).

No backend or environment variables are required — the app runs entirely on a deterministic, seeded mock dataset generated at startup (`src/data/mockData.ts`), so numbers stay stable across reloads but still feel like real marketplace activity.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS (dark, custom design tokens in `tailwind.config.ts`)
- Recharts for area, bar, and treemap visualizations
- TanStack Table for the sortable referral log
- React Router for the four-module navigation
- Framer Motion for route-level page transitions (`AppLayout`); Tailwind keyframes handle micro-interactions like skeleton shimmer and KPI tile fade-in

## Project structure

```
src/
  components/
    layout/      Sidebar, Topbar, AppLayout (dashboard shell), ExecutiveNav (landing page nav)
    filters/      Global filters bar (date range, state, location, category, bundle, payer, referral source)
    charts/       Recharts wrappers: area trend, category bars, heat grid, treemap, distribution
    tables/       RankingTable, ReferralTable (TanStack Table), BundleUsageTable
    ui/           Card, Badge, Button, Select, KpiTile, Skeleton, InsightCard, EmptyState, ThemeToggle
  pages/
    ExecutiveOverviewPage.tsx        Landing page at "/" — hero, challenge, solution, capabilities, footer
    OverviewPage.tsx                 Dashboard root at "/dashboard" — portfolio summary + Performance Insights teaser
    PerformanceInsightsPage.tsx      Flagship cross-module insights, grouped by business category
    VisibilityPage.tsx               Module 1 — Am I visible?
    DemandPage.tsx                   Module 2 — Are payers interested?
    PricingPage.tsx                  Module 3 — How competitive are my prices?
    ReferralsPage.tsx                Module 4 — Are payers choosing me?
    OperationalIntelligencePage.tsx  Referral sources, aging, invoice/voucher throughput
    BundleIntelligencePage.tsx       Marketplace Bundles vs. Transaction Bundles, utilization
  hooks/          useFilters (global filter context), useTheme (light/dark), useDelayedCompute (skeleton loading)
  data/           mockData.ts — deterministic mock dataset generator
  utils/          analytics.ts (aggregation + insights engine), format.ts, random.ts, cn.ts
  types/          Shared domain and analytics types
  constants/      Sidebar navigation config
```

## Routing

- `/` — **Executive Overview**, a standalone marketing/introduction landing page (its own top nav via `ExecutiveNav`, no sidebar or dashboard filters). "Explore Platform" navigates to `/dashboard`.
- `/dashboard`, `/insights`, `/visibility`, `/demand`, `/pricing`, `/referrals`, `/operations`, `/bundles` — the full dashboard, wrapped in `AppLayout` (sidebar + global filters bar), unchanged in behavior from before this update aside from the root path moving from `/` to `/dashboard`.

## Referral sources & Transaction Bundles

Every `Referral` is now tagged with a `source`: `marketplace` (created from a bundle shown in the Marketplace), `direct_referral` (created manually from the Referral List), or `patient_request` (originated in the mobile app, converted by the payer). A new global **Referral Source** filter applies across every referral-driven module.

Bundle usage is modeled at two levels:
- **Marketplace Bundle** (`Bundle`) — catalog inventory: published, priced, searchable.
- **Transaction Bundle** (`TransactionBundleLine`) — what's actually billed inside an Invoice or Voucher for a referral. Most lines point back to a Marketplace Bundle; a minority are one-off **manual bundles** (`bundleId: null`) that were typed in during invoicing and never existed in the catalog.

Bundle Intelligence measures real business usage from these transaction lines (utilization rate, most/least used, manual vs. marketplace share, average bundles per referral) rather than from marketplace visibility alone.

## Performance Insights (flagship section)

`generatePerformanceInsights()` in `src/utils/analytics.ts` combines every module's insights plus two cross-cutting ones (category-vs-category conversion comparison, Patient Request growth), de-duplicates them, and ranks by severity. Each `Insight` now optionally carries a `category` (Opportunity, Warning, Growth, Pricing, Referral, Marketplace) and an `action` — a concrete next step — rendered directly on the insight card. This is fully additive: every existing per-module insight generator and the `InsightsPanel`/`InsightCard` components render exactly as before when `category`/`action` are absent.

## Insights engine

Every module computes an `Insight[]` from the currently filtered data (see the `generate*Insights` functions in `src/utils/analytics.ts`) and renders it through `InsightsPanel`. Insights are phrased in business language (e.g. "This bundle receives many views but very few referrals") rather than raw statistics, and pricing insights never reference competitor identities — only aggregated category-level statistics.

## Theme system (Light / Dark)

- **`src/hooks/useTheme.tsx`** — `ThemeProvider` + `useTheme()`. Resolves the initial theme as: explicit `localStorage["mpi-theme"]` choice → OS `prefers-color-scheme` → dark. Persists every explicit toggle, and keeps following the OS preference live until the person makes their first explicit choice.
- **`src/components/ui/ThemeToggle.tsx`** — the sun/moon toggle in the top bar, with an animated icon swap (Framer Motion).
- **`index.html`** — a small inline script sets the `dark` class on `<html>` synchronously, before React mounts, so there's no flash of the wrong theme on load.
- **`src/index.css`** — every color the app uses is a CSS variable (`--bg-canvas`, `--fg-primary`, `--border-default`, `--chart-grid`, etc.) defined once for `:root` (Light) and once for `.dark` (Dark, values unchanged from before). `tailwind.config.ts` maps semantic Tailwind tokens (`bg-surface`, `text-foreground-tertiary`, `border-border-strong`, …) onto those variables via `rgb(var(--x) / <alpha-value>)`, so opacity modifiers like `bg-surface/80` still work.
- Components reference only semantic tokens now — no component hardcodes a hex value for chrome, text, or borders. Recharts elements (grid lines, axis ticks, tooltip cursors) read the same CSS variables directly as SVG attribute values, so charts re-theme instantly with no extra JS.
- Brand accent colors (`accent-indigo`, `accent-teal`, `accent-amber`, `accent-rose`, `accent-violet`) and the categorical chart palettes are intentionally identical in both themes — consistent brand identity, and already legible on both a near-black and a near-white surface.
- The Dark theme's variable values are byte-for-byte the same colors the app shipped with originally; only the Light theme is new.

## Data model notes

- The current provider's bundle portfolio (~96 bundles across 10 categories and 42 locations) drives every visible chart and table.
- Category-level market pricing statistics (mean, std deviation, min/max, sample size) simulate a much larger anonymized marketplace so pricing comparisons never expose competitor-level data.
- Referral conversion is intentionally correlated with price competitiveness so the Pricing and Demand modules tell a consistent, explorable story.
