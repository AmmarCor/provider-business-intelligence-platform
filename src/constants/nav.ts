import { Eye, TrendingUp, DollarSign, GitBranch, LayoutDashboard, Sparkles, Activity, Package } from "lucide-react";

export interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: typeof Eye;
  /** Visually distinguishes a nav item as a featured/flagship section. */
  highlight?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: "/dashboard",
    label: "Overview",
    description: "Portfolio summary",
    icon: LayoutDashboard,
  },
  {
    path: "/insights",
    label: "Performance Insights",
    description: "What should I do next?",
    icon: Sparkles,
    highlight: true,
  },
  {
    path: "/visibility",
    label: "Visibility",
    description: "Am I visible?",
    icon: Eye,
  },
  {
    path: "/demand",
    label: "Demand",
    description: "Are payers interested?",
    icon: TrendingUp,
  },
  {
    path: "/pricing",
    label: "Pricing",
    description: "How competitive am I?",
    icon: DollarSign,
  },
  {
    path: "/referrals",
    label: "Referrals",
    description: "Are payers choosing me?",
    icon: GitBranch,
  },
  {
    path: "/operations",
    label: "Operations",
    description: "How is my business running?",
    icon: Activity,
  },
  {
    path: "/bundles",
    label: "Bundle Intelligence",
    description: "What am I actually delivering?",
    icon: Package,
  },
];
