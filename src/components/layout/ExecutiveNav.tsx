import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/utils/cn";

export function ExecutiveNav() {
  const location = useLocation();
  const isOverview = location.pathname === "/";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
            <Activity className="h-4 w-4 text-[#0B0D12]" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">Provider BI</p>
            <p className="text-[11px] leading-tight text-foreground-tertiary">Business Intelligence Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            to="/"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isOverview ? "text-foreground" : "text-foreground-tertiary hover:text-foreground-secondary"
            )}
          >
            Executive Overview
          </Link>
          <Link
            to="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-tertiary transition-colors hover:text-foreground-secondary"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/dashboard"
            className="hidden items-center gap-1.5 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-[#0B0D12] transition-transform hover:scale-[1.02] sm:flex"
          >
            Explore Platform
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
