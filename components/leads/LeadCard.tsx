"use client";

import type { Lead } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate, getInitial, scoreColor, scoreLabel } from "@/lib/utils";

type LeadCardProps = {
  lead: Lead;
};

export function LeadCard({ lead }: LeadCardProps) {
  const sc = scoreColor(lead.alignmentScore);

  return (
    <div className="flex gap-3 items-start py-4 border-b border-surface-100 last:border-0 animate-slide-in">
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
        {getInitial(lead.name)}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{lead.name || "—"}</p>
            <p className="text-xs text-slate-500 truncate">
              {[lead.title, lead.company].filter(Boolean).join(" · ")}
            </p>
          </div>

          {lead.alignmentScore !== null && (
            <Badge className={`${sc.bg} ${sc.text} ${sc.border} shrink-0`}>
              {lead.alignmentScore}/10
            </Badge>
          )}
        </div>

        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="text-xs text-brand-500 hover:underline truncate block mt-0.5"
          >
            {lead.email}
          </a>
        )}

        {lead.notes && (
          <p className="text-xs text-slate-400 italic mt-1 truncate">
            &ldquo;{lead.notes}&rdquo;
          </p>
        )}

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-slate-300">{lead.repName}</span>
          <span className="text-[10px] text-slate-200">·</span>
          <span className="text-[10px] text-slate-300">{formatDate(lead.capturedAt)}</span>
          {lead.alignmentScore !== null && (
            <>
              <span className="text-[10px] text-slate-200">·</span>
              <span className={`text-[10px] font-medium ${sc.text}`}>{scoreLabel(lead.alignmentScore)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
