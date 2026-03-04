"use client";

import { useState } from "react";
import { useLeadStore } from "@/hooks/useLeadStore";
import { LeadCard } from "./LeadCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { downloadCSV } from "@/lib/csv";

export function LeadList() {
  const leads = useLeadStore((s) => s.leads);
  const searchLeads = useLeadStore((s) => s.searchLeads);
  const clearLeads = useLeadStore((s) => s.clearLeads);
  const session = useLeadStore((s) => s.session);

  const [query, setQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const displayed = searchLeads(query);

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leads</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {leads.length} captured · {session?.showName ?? ""}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => downloadCSV(leads)}
          disabled={leads.length === 0}
        >
          ⬇ CSV
        </Button>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search name, company, email..."
        className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <Card className="divide-y divide-surface-100 overflow-hidden">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center px-6">
            <span className="text-4xl">📭</span>
            <p className="text-sm text-slate-500">
              {query ? "No leads match your search" : "No leads captured yet — start scanning!"}
            </p>
          </div>
        ) : (
          <div className="px-5">
            {displayed.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </Card>

      {leads.length > 0 && (
        <div className="pt-2">
          {!confirmClear ? (
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => setConfirmClear(true)}
            >
              🗑 Clear All Leads
            </Button>
          ) : (
            <Card className="p-4">
              <p className="text-sm text-slate-700 font-medium mb-3 text-center">
                Delete all {leads.length} leads? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" fullWidth onClick={() => setConfirmClear(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => { clearLeads(); setConfirmClear(false); }}
                >
                  Yes, delete all
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
