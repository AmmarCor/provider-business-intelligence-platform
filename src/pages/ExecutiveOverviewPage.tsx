import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Eye,
  GitBranch,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ExecutiveNav } from "@/components/layout/ExecutiveNav";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const CHALLENGE_QUESTIONS = [
  "Where is my business coming from?",
  "Which services perform best?",
  "Which referral channels generate the most value?",
  "Are my prices competitive?",
  "Which bundles require attention?",
  "How does my performance compare with the market?",
];

const CAPABILITIES = [
  {
    icon: Eye,
    title: "Marketplace Intelligence",
    description: "See how payers discover and engage with your published bundles across the marketplace.",
  },
  {
    icon: Activity,
    title: "Operational Intelligence",
    description: "Track referral sources, aging, and invoice and voucher throughput across your entire operation.",
  },
  {
    icon: GitBranch,
    title: "Referral Intelligence",
    description: "Monitor referral volume, success rates, and follow-through from request to completion.",
  },
  {
    icon: Package,
    title: "Bundle Intelligence",
    description: "Compare marketplace catalog inventory against what you actually deliver and bill.",
  },
  {
    icon: DollarSign,
    title: "Pricing Intelligence",
    description: "Benchmark your pricing against anonymized, aggregated market data without exposing competitors.",
  },
  {
    icon: Sparkles,
    title: "Performance Insights",
    description: "Get plain-language, action-oriented insights that explain what happened and what to do next.",
  },
];

const BUSINESS_QUESTIONS = [
  "Are payers seeing my bundles?",
  "Which bundles generate referrals?",
  "Which referral sources perform best?",
  "Are my prices competitive?",
  "Which services generate the most business?",
  "Which bundles require attention?",
  "How healthy is my referral pipeline?",
  "Where is demand growing?",
  "How do I compare with the market?",
  "What actions should I take next?",
];

const BUSINESS_VALUE = [
  { icon: Eye, title: "Increase Marketplace Visibility", description: "Understand and improve how often payers discover your bundles." },
  { icon: DollarSign, title: "Improve Pricing Strategy", description: "Position every bundle against real, aggregated market benchmarks." },
  { icon: GitBranch, title: "Optimize Referral Performance", description: "Strengthen conversion across every referral source and channel." },
  { icon: Package, title: "Understand Bundle Utilization", description: "See what's actually delivered and billed, not just published." },
  { icon: TrendingUp, title: "Identify Growth Opportunities", description: "Spot rising channels and underperforming areas early." },
  { icon: BarChart3, title: "Make Data-Driven Decisions", description: "Replace assumptions with action-oriented, plain-language insights." },
];

function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; description?: string; title: string }) {
  return (
    <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-indigo">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-relaxed text-foreground-tertiary sm:text-base">{description}</p>}
    </motion.div>
  );
}

export function ExecutiveOverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <ExecutiveNav />

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div
          className="pointer-events-none absolute inset-x-0 top-[-10%] -z-10 h-[560px] opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(600px circle at 20% 20%, rgba(91,141,239,0.25), transparent 60%), radial-gradient(600px circle at 80% 10%, rgba(62,207,142,0.2), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-indigo/25 bg-accent-indigo/[0.07] px-3.5 py-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-indigo" />
            <span className="text-xs font-medium text-foreground-secondary">Enterprise Business Intelligence for Healthcare Providers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Provider Business
            <br />
            Intelligence Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-lg font-medium text-foreground-secondary"
          >
            One Platform. Complete Business Visibility.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-foreground-tertiary sm:text-base"
          >
            Transform marketplace activity, referral operations, pricing intelligence, and operational performance
            into actionable business intelligence that helps healthcare providers make smarter decisions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.26 }}
            className="mt-9 flex items-center justify-center"
          >
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-6 py-3 text-sm font-semibold text-[#0B0D12] shadow-glow transition-transform hover:scale-[1.02]"
            >
              Explore Platform
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The Challenge                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="The Challenge"
            title="Providers manage a lot. Visibility rarely keeps up."
            description="Healthcare providers manage referrals, bundles, invoices, pricing, payer relationships, and operational workflows every day — but without centralized business intelligence, teams often rely on assumptions instead of data."
          />
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CHALLENGE_QUESTIONS.map((q, i) => (
              <motion.div
                key={q}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="flex items-center gap-3 rounded-xl2 border border-border bg-surface/80 px-4 py-3.5 shadow-panel-light backdrop-blur-sm dark:shadow-panel"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-border/60 text-xs font-semibold text-foreground-tertiary">
                  ?
                </span>
                <p className="text-sm text-foreground-secondary">{q}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Our Solution                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border bg-surface/40 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Our Solution"
            title="Every part of your business, in one decision-support platform"
            description="Provider Business Intelligence Platform combines Marketplace Intelligence, Operational Intelligence, Referral Analytics, Bundle Intelligence, Pricing Intelligence, and Performance Insights into one unified experience. Rather than simply displaying reports, it helps you understand what happened, why it happened, and what to do next."
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Platform Capabilities                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Platform Capabilities" title="Six modules. One unified view." />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.title}
                  {...fadeUp}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="group rounded-xl2 border border-border bg-surface/80 p-6 shadow-panel-light backdrop-blur-sm transition-all duration-200 hover:border-border-strong hover:shadow-glow dark:shadow-panel"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-gradient">
                    <Icon className="h-5 w-5 text-[#0B0D12]" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-tertiary">{cap.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Business Questions We Answer                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border bg-surface/40 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Business Questions We Answer" title="Ask the questions that actually run your business" />
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {BUSINESS_QUESTIONS.map((q, i) => (
              <motion.div
                key={q}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface/80 px-4 py-3"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-teal" />
                <p className="text-sm text-foreground-secondary">{q}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Business Value                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Business Value" title="What providers gain on day one" />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BUSINESS_VALUE.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  {...fadeUp}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="rounded-xl2 border border-accent-indigo/20 bg-accent-indigo/[0.04] p-6 transition-colors hover:border-accent-indigo/35 hover:bg-accent-indigo/[0.07]"
                >
                  <Icon className="h-5 w-5 text-accent-indigo" />
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-tertiary">{v.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Closing CTA                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-border px-6 py-20 sm:py-24">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-3xl flex-col items-center rounded-xl2 border border-border bg-surface/80 p-10 text-center shadow-panel-light backdrop-blur-sm dark:shadow-panel"
        >
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Ready to see your business clearly?</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-tertiary sm:text-base">
            Step into the full Provider Business Intelligence Platform dashboard — every module, every insight, ready now.
          </p>
          <Link
            to="/dashboard"
            className="group mt-7 inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-6 py-3 text-sm font-semibold text-[#0B0D12] shadow-glow transition-transform hover:scale-[1.02]"
          >
            Explore Platform
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-gradient">
              <Activity className="h-3.5 w-3.5 text-[#0B0D12]" />
            </div>
            <p className="text-sm font-semibold text-foreground">Provider Business Intelligence Platform</p>
          </div>
          <p className="text-xs text-foreground-tertiary">Turning healthcare operational data into smarter business decisions.</p>
        </div>
      </footer>
    </div>
  );
}
