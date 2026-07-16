/**
 * Centralized metric definitions for the Contextual Tooltip System.
 *
 * Every KPI, chart title, and table header that offers contextual help
 * points at one entry here by `metricId`. Adding help text for a new metric
 * means adding one object below — no component needs to duplicate tooltip
 * markup or copy.
 */

export interface MetricDefinition {
  /** Displayed as the tooltip's heading. Matches the visible label in most cases. */
  title: string;
  /** Plain-language explanation of what the metric represents. */
  definition: string;
  /** Why a provider should care about / monitor this metric. */
  whyItMatters: string;
  /** Business calculation, shown as a short formula string. Omit when not applicable. */
  calculation?: string;
  /** A concrete, actionable recommendation. */
  businessTip: string;
}

export const METRIC_DEFINITIONS = {
  // ---------------------------------------------------------------------
  // Shared / Overview
  // ---------------------------------------------------------------------
  totalBundleViews: {
    title: "Total Bundle Views",
    definition: "The number of times your marketplace bundles were viewed by payers during the selected period.",
    whyItMatters: "Views are the top of your funnel — without visibility, even a well-priced bundle can't generate referrals.",
    businessTip: "If views are flat or falling, review bundle titles, categories, and pricing before assuming demand has dropped.",
  },
  referralRequests: {
    title: "Referral Requests",
    definition: "The total number of referrals created for your bundles during the selected period, across all sources.",
    whyItMatters: "Referral volume is the clearest signal of real business demand, independent of how a payer found you.",
    businessTip: "Compare this against the prior period to spot momentum shifts before they show up in revenue.",
  },
  viewToReferralRate: {
    title: "View-to-Referral Rate",
    definition: "The share of marketplace views that convert into a referral request.",
    calculation: "Referral Requests ÷ Bundle Views",
    whyItMatters: "This isolates how compelling your listing and pricing are, separate from how much traffic you get.",
    businessTip: "A low rate despite strong views usually points to a pricing or positioning problem, not a visibility one.",
  },
  bundlesPricedAboveMarket: {
    title: "Bundles Priced Above Market",
    definition: "The count of your bundles priced above the aggregated marketplace average for their category.",
    whyItMatters: "Above-market pricing is one of the most common reasons a visible, well-reviewed bundle still underperforms.",
    businessTip: "Start a pricing review with the bundles furthest above market — they carry the most upside.",
  },
  viewsTrend: {
    title: "Views Trend",
    definition: "Daily marketplace views across your bundle portfolio for the selected filters.",
    whyItMatters: "Trend direction matters more than any single day's number — it tells you whether visibility is improving or eroding.",
    businessTip: "Look for week-over-week shifts of 10% or more; smaller day-to-day noise is usually not meaningful.",
  },

  // ---------------------------------------------------------------------
  // Visibility Intelligence
  // ---------------------------------------------------------------------
  zeroViewBundles: {
    title: "Zero-View Bundles",
    definition: "Bundles that received no marketplace views at all during the selected period.",
    whyItMatters: "A bundle payers never see can never generate a referral — this is pure lost opportunity, not underperformance.",
    businessTip: "Check these bundles' titles, category tagging, and pricing; an unpublished or miscategorized listing is a common cause.",
  },
  topState: {
    title: "Top State",
    definition: "The state that generated the largest share of your bundle views in the selected period.",
    whyItMatters: "Knowing where attention concentrates helps you prioritize where to expand or promote next.",
    businessTip: "Consider testing new bundles or promotional pricing in this state first — it's where demand is already proven.",
  },
  activeBundlesViewed: {
    title: "Active Bundles Viewed",
    definition: "The number of your bundles that received at least one view, out of your total portfolio.",
    whyItMatters: "A large gap between this number and your total bundle count means a meaningful share of your catalog is invisible.",
    businessTip: "Prioritize fixing visibility on unviewed bundles before adding new ones to the catalog.",
  },
  viewsByCategory: {
    title: "Views by Category",
    definition: "Marketplace views broken down by medical specialty category.",
    whyItMatters: "Category-level demand shows you where payer interest is concentrated across your service lines.",
    businessTip: "Double down on marketing spend in your highest-viewed categories before investing in low-interest ones.",
  },
  viewsByState: {
    title: "Views by State",
    definition: "Marketplace views broken down by the state where each bundle is located.",
    whyItMatters: "Geographic concentration reveals where your marketplace presence is strongest and where it's underdeveloped.",
    businessTip: "Use low-view states to decide where added marketing or new bundle listings would have the most impact.",
  },
  viewsByLocation: {
    title: "Views by Location",
    definition: "Marketplace views broken down by city and location.",
    whyItMatters: "Location-level detail is more actionable than state-level for multi-site providers deciding where to invest.",
    businessTip: "Compare similarly-sized locations — a large gap in views often points to a listing or pricing issue at one site.",
  },
  topViewedBundles: {
    title: "Top Viewed Bundles",
    definition: "The bundles that received the most marketplace views in the selected period.",
    whyItMatters: "These bundles show you what currently attracts payer attention — a template worth repeating.",
    businessTip: "Check whether your top-viewed bundles also convert well; if not, pricing is likely the gap.",
  },
  lowestViewedBundles: {
    title: "Lowest Viewed Bundles",
    definition: "Bundles with the fewest marketplace views, excluding bundles with zero views entirely.",
    whyItMatters: "These are borderline listings — one improvement to title, price, or category could meaningfully change their visibility.",
    businessTip: "Refresh the listing details on these bundles before considering whether to unpublish them.",
  },

  // ---------------------------------------------------------------------
  // Demand Intelligence
  // ---------------------------------------------------------------------
  overallConversionRate: {
    title: "Overall Conversion Rate",
    definition: "The share of all marketplace views across your portfolio that resulted in a referral request.",
    calculation: "Total Referral Requests ÷ Total Bundle Views",
    whyItMatters: "This is your portfolio-wide health check for how well visibility is translating into real business.",
    businessTip: "Track this rate over time as your single best early-warning indicator of a pricing or positioning problem.",
  },
  bundlesUnderconverting: {
    title: "Bundles Underconverting",
    definition: "Bundles with meaningful view volume but a conversion rate well below your portfolio average.",
    whyItMatters: "These bundles are attracting attention that isn't turning into business — a clear, fixable gap.",
    businessTip: "Test a price adjustment on these bundles first; it's the most common lever that moves conversion.",
  },
  bundlesAboveAverageConversion: {
    title: "Bundles Above Average Conversion",
    definition: "Bundles converting views into referral requests at a rate above your portfolio average.",
    whyItMatters: "These bundles show you what pricing and positioning combination is currently working best.",
    businessTip: "Apply the pricing and category strategy from these bundles to similar underperforming ones.",
  },
  referralTrend: {
    title: "Referral Trend",
    definition: "Referral requests created per day across the selected filters, from every referral source.",
    whyItMatters: "This tells you whether demand for your services is growing, flat, or shrinking — independent of visibility.",
    businessTip: "A rising view trend with a flat referral trend is a strong signal to review pricing.",
  },
  referralsPerBundle: {
    title: "Referral Requests per Bundle",
    definition: "The number of referral requests generated by each individual bundle.",
    whyItMatters: "Bundle-level detail shows you exactly which listings are driving your referral volume.",
    businessTip: "Protect and promote your top referral-generating bundles — they're your most reliable revenue source.",
  },
  highViewsLowReferrals: {
    title: "High Views, Low Referrals",
    definition: "Bundles receiving strong marketplace attention but converting very few of those views into referral requests.",
    whyItMatters: "Pricing is the most common explanation when interest is clearly present but referrals aren't following.",
    businessTip: "Test a price reduction or repositioning on these specific bundles — the demand is already there.",
  },
  highPerformingBundles: {
    title: "High Performing Bundles",
    definition: "Bundles with the best view-to-referral conversion rate in your portfolio.",
    whyItMatters: "These represent your most effective pricing and positioning combinations right now.",
    businessTip: "Use these bundles as a pricing benchmark when launching or repricing similar services.",
  },
  lowPerformingBundles: {
    title: "Low Performing Bundles",
    definition: "Bundles with meaningful view volume but weak conversion into referral requests.",
    whyItMatters: "These bundles are costing you visibility investment without a proportional business return.",
    businessTip: "Reassess pricing first, then category and title, before deciding whether to keep a bundle listed.",
  },

  // ---------------------------------------------------------------------
  // Pricing Intelligence
  // ---------------------------------------------------------------------
  avgPriceVsMarket: {
    title: "Average Price vs. Market",
    definition: "The average percentage difference between your bundle prices and the aggregated marketplace average for their categories.",
    whyItMatters: "A single portfolio-wide number tells you at a glance whether you're generally positioned as a value or premium provider.",
    businessTip: "If this trends upward over time without a matching rise in conversion, your pricing may be drifting out of step with the market.",
  },
  pricedBelowMarket: {
    title: "Priced Below Market",
    definition: "The number of your bundles priced below the aggregated marketplace average for their category.",
    whyItMatters: "Below-market pricing typically supports stronger conversion, but only if margins can sustain it.",
    businessTip: "Confirm margin health on these bundles before using them as a template for further price cuts elsewhere.",
  },
  alignedWithMarket: {
    title: "Aligned with Market",
    definition: "Bundles priced within a normal competitive range of the aggregated marketplace average for their category.",
    whyItMatters: "For these bundles, price is unlikely to be a limiting factor — other levers matter more.",
    businessTip: "Focus on visibility and listing quality rather than further price changes for these bundles.",
  },
  significantlyAboveMarket: {
    title: "Significantly Above Market",
    definition: "Bundles priced well above the aggregated marketplace average for their category.",
    whyItMatters: "This is the single most common reason a visible, well-reviewed bundle still fails to convert.",
    businessTip: "Prioritize a pricing review on these bundles — even a modest reduction can materially improve conversion.",
  },
  pricePositioningTable: {
    title: "Price Positioning by Bundle",
    definition: "A bundle-by-bundle comparison of your price against the aggregated marketplace average for that category.",
    whyItMatters: "Portfolio-wide pricing averages can hide individual bundles that are significantly mispriced.",
    businessTip: "Sort by the largest gaps first — that's where a pricing change will have the most impact.",
  },
  marketPositionDetail: {
    title: "Market Position Detail",
    definition: "Where a specific bundle's price falls within the anonymized, aggregated distribution of similar marketplace bundles.",
    whyItMatters: "Seeing the full distribution — not just an average — shows you how much room you actually have to move price.",
    businessTip: "If you're already near the low end of the distribution, focus on visibility rather than further discounting.",
  },

  // ---------------------------------------------------------------------
  // Referral Intelligence
  // ---------------------------------------------------------------------
  totalReferrals: {
    title: "Total Referrals",
    definition: "The total number of referrals created for your bundles during the selected period.",
    whyItMatters: "This is the core volume metric for your referral pipeline, across every source and channel.",
    businessTip: "Watch this alongside how many of those referrals actually get invoiced — volume without follow-through doesn't translate into revenue.",
  },
  referralSuccessRate: {
    title: "Referrals with Invoices",
    definition: "The percentage of referrals that resulted in at least one invoice being generated.",
    calculation: "Referrals with Invoices ÷ Total Referrals",
    whyItMatters: "A referral that never becomes billable business isn't delivering value, regardless of how it started.",
    businessTip: "If this rate is low, investigate where referrals stall — chat response time and scheduling delays are common causes.",
  },
  staleReferrals: {
    title: "Stale Referrals",
    definition: "Open referrals that have had no activity — no chat, timeline update, invoice, or voucher — in over 21 days.",
    whyItMatters: "Stale referrals quietly erode your pipeline; each one represents a payer relationship going cold.",
    businessTip: "Follow up directly with the payer on each stale referral this week before it lapses entirely.",
  },
  referralsWithoutInvoices: {
    title: "Referrals Without Invoices",
    definition: "Referrals that have not produced a single invoice, regardless of age or status.",
    whyItMatters: "This is your clearest view of referral volume that hasn't yet converted into billable business.",
    businessTip: "Segment by age — recent ones may just be in progress, but older ones likely need direct follow-up or closure.",
  },
  referralsByState: {
    title: "Referrals by State",
    definition: "Referral volume broken down by the state associated with each referral.",
    whyItMatters: "Geographic referral concentration shows you where payer demand is strongest right now.",
    businessTip: "Consider expanding capacity or bundle variety in your highest-referral states first.",
  },
  referralsByPayer: {
    title: "Referrals by Payer",
    definition: "Referral volume broken down by the payer organization that submitted each referral.",
    whyItMatters: "Payer concentration tells you which relationships are driving the most business — and which are underused.",
    businessTip: "Reach out to payers with historically strong volume if their referrals have recently slowed.",
  },
  referralsByBundle: {
    title: "Referrals by Bundle",
    definition: "Referral volume ranked by individual bundle across your entire portfolio.",
    whyItMatters: "Bundle-level referral ranking shows you exactly which services are carrying your pipeline.",
    businessTip: "Protect your top referral-generating bundles from pricing or listing changes that could disrupt performance.",
  },
  needsAttentionReferrals: {
    title: "Referrals Needing Attention",
    definition: "Referrals that are either stale (21+ days with no activity) or old with no invoice (90+ days).",
    whyItMatters: "These referrals are the most likely to be silently lost if they aren't actively managed.",
    businessTip: "Work through this list weekly — most stalled referrals can still be recovered with a direct follow-up.",
  },
  allReferralsTable: {
    title: "All Referrals",
    definition: "The complete, sortable log of referral activity for the current filters.",
    whyItMatters: "Aggregate KPIs can hide individual referrals that need direct attention — this is the detail view.",
    businessTip: "Sort by last activity to quickly surface referrals that have gone quiet.",
  },

  // ---------------------------------------------------------------------
  // Operational Intelligence
  // ---------------------------------------------------------------------
  totalReferralVolume: {
    title: "Total Referral Volume",
    definition: "The total number of referrals across all sources — Marketplace, Direct Referral, and Patient Request — for the selected filters.",
    whyItMatters: "This is the single top-line number for how much business is entering your pipeline right now.",
    businessTip: "If volume is healthy but revenue isn't following, look at invoice creation rate next.",
  },
  invoiceCreationRate: {
    title: "Invoice Creation Rate",
    definition: "The share of referrals that have produced at least one invoice.",
    calculation: "Referrals with an Invoice ÷ Total Referrals",
    whyItMatters: "This measures how efficiently your operation turns referral volume into billable activity.",
    businessTip: "A declining rate despite steady referral volume usually points to a workflow bottleneck, not a demand problem.",
  },
  voucherCreationRate: {
    title: "Voucher Creation Rate",
    definition: "The share of referrals that have had a voucher created.",
    calculation: "Referrals with a Voucher ÷ Total Referrals",
    whyItMatters: "Voucher usage patterns can reveal how payers prefer to structure payment for your services.",
    businessTip: "If voucher usage is concentrated in a few payers, confirm your team's workflow supports it smoothly.",
  },
  activeVsArchived: {
    title: "Active vs. Archived Referrals",
    definition: "Active referrals are still realistically in motion; archived referrals have reached a terminal status and gone quiet.",
    whyItMatters: "A healthy pipeline keeps a manageable, mostly-active referral base rather than a large backlog of dormant ones.",
    businessTip: "If archived referrals are growing faster than active ones, prioritize working through open referrals sooner.",
  },
  referralSourceDistribution: {
    title: "Referral Source Distribution",
    definition: "The share of referrals originating from Marketplace, Direct Referral, and Patient Request.",
    whyItMatters: "Understanding your channel mix helps you decide where to invest operational and marketing effort.",
    businessTip: "If one channel dominates, evaluate whether the others are underdeveloped or genuinely lower-value.",
  },
  referralAging: {
    title: "Referral Aging",
    definition: "Open referrals grouped by how long they've been in progress, from under a week to over 90 days.",
    whyItMatters: "Aging distribution shows you whether referrals are moving through your workflow at a healthy pace.",
    businessTip: "A growing 90+ day bucket is an early warning sign of a workflow bottleneck worth investigating now.",
  },

  // ---------------------------------------------------------------------
  // Bundle Intelligence
  // ---------------------------------------------------------------------
  bundleUtilizationRate: {
    title: "Bundle Utilization Rate",
    definition: "The share of your published Marketplace Bundles that have appeared in at least one real invoice or voucher.",
    calculation: "Marketplace Bundles Used ÷ Total Marketplace Bundles",
    whyItMatters: "A large gap between your catalog size and this rate means you're maintaining listings that aren't generating business.",
    businessTip: "Prune or repackage bundles with no transaction history rather than letting an oversized catalog dilute your visibility.",
  },
  marketplaceVsManualBundles: {
    title: "Marketplace vs. Manual Bundles",
    definition: "The split between transaction lines that reference a published Marketplace Bundle versus a one-off manual bundle typed in during invoicing.",
    whyItMatters: "A high manual share suggests real billed services that aren't represented in your marketplace catalog at all.",
    businessTip: "Publish your most frequent manual bundles to the Marketplace catalog to improve pricing consistency and visibility.",
  },
  manualBundleShare: {
    title: "Manual Bundle Share",
    definition: "The percentage of all invoiced and vouchered services that were manual, one-off bundles rather than catalog bundles.",
    calculation: "Manual Bundle Lines ÷ Total Bundle Lines",
    whyItMatters: "This is a direct measure of how much of your real business is invisible to marketplace-level analytics.",
    businessTip: "A rising manual share over time is a signal to review and expand your published bundle catalog.",
  },
  avgBundlesPerReferral: {
    title: "Average Bundles per Referral",
    definition: "The average number of bundle lines billed per referral that produced at least one transaction.",
    whyItMatters: "This reflects how often a single referral turns into multiple billed services, a key driver of revenue per referral.",
    businessTip: "If this number is low, consider whether complementary bundles could be offered alongside your most common referral.",
  },
  bundleUsageTrend: {
    title: "Bundle Usage Trend",
    definition: "The number of transaction bundle lines — invoice and voucher combined — created per day.",
    whyItMatters: "This tracks actual billed business activity over time, distinct from marketplace views or referral counts.",
    businessTip: "A flat usage trend despite rising referrals suggests a delay somewhere between referral and billing.",
  },
  mostFrequentlyInvoiced: {
    title: "Most Frequently Invoiced",
    definition: "The bundles that appear most often as a line item on an invoice.",
    whyItMatters: "These are your highest-volume billed services — the core of your day-to-day revenue.",
    businessTip: "Make sure your highest-invoiced bundles always have accurate, up-to-date marketplace pricing.",
  },
  mostUsedBundles: {
    title: "Most Used Bundles",
    definition: "Bundles with the highest total transaction volume, combining both marketplace and manual bundle lines.",
    whyItMatters: "This is the most complete view of what you actually deliver, regardless of whether it's cataloged.",
    businessTip: "If a heavily-used bundle isn't in your marketplace catalog, publishing it is a quick visibility win.",
  },
  leastUsedBundles: {
    title: "Least Used Marketplace Bundles",
    definition: "Published Marketplace Bundles with the lowest transaction volume among bundles that have been used at least once.",
    whyItMatters: "Low-usage catalog bundles take up shelf space in your listings without contributing meaningfully to revenue.",
    businessTip: "Reassess pricing or positioning on these bundles before deciding whether to keep them published.",
  },
  mostFrequentlyVouchered: {
    title: "Most Frequently Vouchered",
    definition: "The bundles most often used inside a voucher rather than a direct invoice.",
    whyItMatters: "Voucher-heavy bundles may follow a different payer workflow than your typical invoiced services.",
    businessTip: "Confirm these bundles' pricing and terms are well-suited to voucher-based payer arrangements.",
  },

  // ---------------------------------------------------------------------
  // Performance Insights
  // ---------------------------------------------------------------------
  totalInsightsCount: {
    title: "Total Insights This Period",
    definition: "The total number of business insights generated across every module for the current filters.",
    whyItMatters: "This is a quick pulse check on how much is actively changing in your business right now.",
    businessTip: "A sudden spike in insight count is worth a closer look — it usually means several metrics moved at once.",
  },
  needsImmediateAttention: {
    title: "Needs Immediate Attention",
    definition: "The number of critical-severity insights — the ones most likely to need action this week.",
    whyItMatters: "These are ranked first because they typically represent the highest-cost problems if left unaddressed.",
    businessTip: "Work through critical insights before warnings — they're where the largest business impact usually is.",
  },
  worthWatching: {
    title: "Worth Watching",
    definition: "The number of warning-severity insights — trends worth monitoring but not yet urgent.",
    whyItMatters: "Catching a warning early often prevents it from becoming a critical issue later.",
    businessTip: "Revisit this list each time you review the dashboard to catch developing trends before they escalate.",
  },
  workingWell: {
    title: "Working Well",
    definition: "The number of positive-toned insights — areas of your business currently performing above expectation.",
    whyItMatters: "Understanding what's working is just as valuable as fixing what isn't — it shows you what to replicate.",
    businessTip: "Apply the pricing or positioning strategy behind these wins to similar underperforming bundles.",
  },

  // ---------------------------------------------------------------------
  // Table header helpers
  // ---------------------------------------------------------------------
  referralStatusColumn: {
    title: "Status",
    definition: "Where a referral currently sits in its lifecycle: New, In Review, Scheduled, Completed, or Cancelled.",
    whyItMatters: "Status distribution across your referral list shows you where work is concentrated in your pipeline.",
    businessTip: "A growing number of referrals stuck in one status is usually a sign of a workflow bottleneck at that step.",
  },
  lastActivityColumn: {
    title: "Last Activity",
    definition: "How long ago this referral last had any activity — a chat message, timeline update, invoice, or voucher.",
    whyItMatters: "Recency of activity is often a better health signal than status alone for whether a referral is progressing.",
    businessTip: "Referrals with no activity in 21+ days are flagged as stale — follow up on them directly.",
  },
  bundleOriginColumn: {
    title: "Origin",
    definition: "Whether a billed bundle line references a published Marketplace Bundle or was a one-off manual entry.",
    whyItMatters: "A high share of manual origin lines means real business is happening outside your marketplace catalog.",
    businessTip: "Consider publishing frequently-used manual bundles to the Marketplace catalog for better pricing consistency.",
  },

  // ---------------------------------------------------------------------
  // Overview page navigational cards
  // ---------------------------------------------------------------------
  exploreModulesCard: {
    title: "Explore Every Module",
    definition: "Quick links into each of the platform's modules, each answering one of the core business questions.",
    whyItMatters: "The right module depends on what decision you're trying to make right now — visibility, pricing, referrals, or operations.",
    businessTip: "Start with Performance Insights if you're not sure where to look — it surfaces the most urgent items across every module.",
  },
  topPerformanceInsightsCard: {
    title: "Top Performance Insights",
    definition: "A preview of the highest-priority insights generated across every module for the current filters.",
    whyItMatters: "This is the fastest way to see what changed and what needs attention without visiting every module individually.",
    businessTip: "Visit the full Performance Insights page for the complete, categorized list and suggested actions.",
  },

  // ---------------------------------------------------------------------
  // Performance Insights category groupings
  // ---------------------------------------------------------------------
  insightCategoryOpportunity: {
    title: "Opportunity",
    definition: "Insights identifying upside that hasn't been captured yet — demand or visibility that isn't converting.",
    whyItMatters: "Opportunities are the fastest wins available right now, since the underlying demand already exists.",
    businessTip: "Work through opportunity insights before broader strategic changes — they typically have the best effort-to-impact ratio.",
  },
  insightCategoryWarning: {
    title: "Warning",
    definition: "Insights flagging a developing problem that hasn't become critical yet, such as a slowing trend or an aging referral.",
    whyItMatters: "Catching a warning early is usually far cheaper than fixing the same issue once it becomes critical.",
    businessTip: "Review warnings on a regular cadence — most are preventable if addressed within a week or two.",
  },
  insightCategoryGrowth: {
    title: "Growth",
    definition: "Insights highlighting what's currently working well and trending in a positive direction.",
    whyItMatters: "Understanding what's driving growth tells you what to protect and where to replicate the same approach.",
    businessTip: "Apply the pricing or positioning strategy behind growth insights to similar underperforming bundles or states.",
  },
  insightCategoryPricing: {
    title: "Pricing",
    definition: "Insights specifically about how your pricing compares to the aggregated marketplace and how it's affecting conversion.",
    whyItMatters: "Pricing is one of the few levers you can adjust immediately, and it's the most common explanation for weak conversion.",
    businessTip: "Prioritize pricing insights on your highest-view bundles first — that's where a change has the most reach.",
  },
  insightCategoryReferral: {
    title: "Referral",
    definition: "Insights about referral volume, source mix, aging, and follow-through toward completion.",
    whyItMatters: "Referral health is the clearest signal of whether marketplace activity is actually turning into business.",
    businessTip: "Address stale or aging referrals promptly — they're the most recoverable if caught early.",
  },
  insightCategoryMarketplace: {
    title: "Marketplace",
    definition: "Insights about visibility and discovery — how often payers see and engage with your published bundles.",
    whyItMatters: "Marketplace visibility is the top of the funnel; a strong pipeline downstream still depends on being seen first.",
    businessTip: "If marketplace insights are all neutral or positive, look at Referral and Pricing categories for the next opportunity.",
  },
} as const satisfies Record<string, MetricDefinition>;

export type MetricId = keyof typeof METRIC_DEFINITIONS;
