"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLeadStore } from "@/hooks/useLeadStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/scan",      label: "Scan",    icon: "📸" },
  { href: "/dashboard", label: "Leads",   icon: "🗂" },
  { href: "/pricing",   label: "Upgrade", icon: "⚡" },
] as const;

export function NavBar() {
  const pathname = usePathname();
  const leads = useLeadStore((s) => s.leads);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-surface-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-600 tracking-tight">
          <span className="text-lg">🎪</span>
          <span>LeadSnap</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href;
            const count = label === "Leads" ? leads.length : null;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all",
                  active
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-500 hover:text-slate-700 hover:bg-surface-100"
                )}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {count !== null && count > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
