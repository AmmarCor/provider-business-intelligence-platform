import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Activity, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/constants/nav";
import { cn } from "@/utils/cn";

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-sidebar/60 px-4 py-5 lg:flex">
      <Link to="/" className="mb-8 flex items-center gap-2.5 px-2 transition-opacity hover:opacity-80">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
          <Activity className="h-4 w-4 text-[#0B0D12]" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">Provider BI</p>
          <p className="text-[11px] leading-tight text-foreground-tertiary">Business Intelligence Platform</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-foreground-quaternary">Modules</p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors",
                  item.highlight && !isActive && "border border-accent-indigo/25 bg-accent-indigo/[0.06]",
                  isActive
                    ? "bg-surface-hover text-foreground"
                    : "text-foreground-tertiary hover:bg-surface hover:text-foreground-secondary"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-accent-indigo" : item.highlight ? "text-accent-indigo" : "text-foreground-quaternary group-hover:text-foreground-tertiary"
                    )}
                  />
                  <span className="flex-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      {item.label}
                      {item.highlight && (
                        <span className="rounded-full bg-accent-gradient px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#0B0D12]">
                          New
                        </span>
                      )}
                    </span>
                    <span className="block text-[11px] text-foreground-quaternary">{item.description}</span>
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl2 border border-border bg-surface/60 p-3.5">
        <div className="mb-1.5 flex items-center gap-1.5 text-accent-amber">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-wide">Insights engine</span>
        </div>
        <p className="text-[11px] leading-relaxed text-foreground-tertiary">
          Every module surfaces plain-language explanations behind the numbers — not just charts.
        </p>
      </div>
    </aside>
  );
}
