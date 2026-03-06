"use client";

import { useState } from "react";
import type { ExtractedCard, LeadInput, RepSession } from "@/types";
import { useLeadStore } from "@/hooks/useLeadStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type EditableExtractedField =
  | "name"
  | "title"
  | "company"
  | "email"
  | "phone"
  | "linkedin"
  | "website"
  | "instagram"
  | "tiktok"
  | "location";

const FIELDS: { key: EditableExtractedField; label: string; icon: string; type?: string }[] = [
  { key: "name",     label: "Full Name",  icon: "👤" },
  { key: "title",    label: "Title",      icon: "💼" },
  { key: "company",  label: "Company",    icon: "🏢" },
  { key: "email",    label: "Email",      icon: "✉️",  type: "email" },
  { key: "phone",    label: "Phone",      icon: "📞",  type: "tel" },
  { key: "linkedin", label: "LinkedIn",   icon: "🔗",  type: "url" },
  { key: "website",  label: "Website",    icon: "🌐",  type: "url" },
  { key: "instagram",label: "Instagram",  icon: "📸" },
  { key: "tiktok",   label: "TikTok",     icon: "🎵" },
  { key: "location", label: "Location",   icon: "📍" },
];

type CardReviewProps = {
  extracted: ExtractedCard;
  images: { front: string | null; back: string | null };
  onSave: (input: LeadInput) => void;
  onBack: () => void;
};

export function CardReview({ extracted, images, onSave, onBack }: CardReviewProps) {
  const session = useLeadStore((s) => s.session) as RepSession;
  const [form, setForm] = useState<ExtractedCard>({ ...extracted });
  const [notes, setNotes] = useState("");

  const set = (key: EditableExtractedField, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const cardImageFields = {
      ...(images.front ? { cardImageFront: images.front } : {}),
      ...(images.back ? { cardImageBack: images.back } : {}),
    };

    onSave({
      ...session,
      ...form,
      notes,
      alignmentScore: form.alignmentScore,
      alignmentRationale: form.alignmentRationale,
      ...cardImageFields,
    });
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-brand-500 text-sm font-semibold hover:text-brand-700 transition-colors"
        >
          ← Rescan
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Review & Confirm</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          AI extracted the info below — edit anything before saving.
        </p>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        {FIELDS.map((f) => (
          <Input
            key={f.key}
            label={f.label}
            icon={f.icon}
            type={f.type ?? "text"}
            value={form[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
          />
        ))}

        <div className="border-t border-surface-100 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              📝 Notes / Follow-up
            </label>
            <textarea
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:bg-white resize-none transition-all"
              rows={3}
              placeholder="e.g. Interested in Q3 pilot, follow up by Thursday"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">⭐ Alignment Score</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {form.alignmentScore !== null ? `${form.alignmentScore}/10` : "N/A"}
            </p>
            {form.alignmentRationale && (
              <p className="text-sm text-slate-600 mt-1">{form.alignmentRationale}</p>
            )}
            {!form.alignmentRationale && (
              <p className="text-sm text-slate-500 mt-1">Not enough signal from card details.</p>
            )}
          </div>
        </div>

        <Button
          size="lg"
          fullWidth
          className="bg-emerald-500 hover:bg-emerald-600 shadow-none mt-1"
          onClick={handleSave}
        >
          💾 Save Lead
        </Button>
      </Card>
    </div>
  );
}
