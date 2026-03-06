"use client";

import { useEffect, useState } from "react";
import { useLeadStore } from "@/hooks/useLeadStore";
import { repSessionSchema } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const setSession = useLeadStore((s) => s.setSession);
  const hasHydrated = useLeadStore((s) => s.hasHydrated);
  const session = useLeadStore((s) => s.session);

  const [repName, setRepName] = useState(session?.repName ?? "");
  const [showName, setShowName] = useState(session?.showName ?? "");
  const [errors, setErrors] = useState<{ repName?: string; showName?: string }>({});

  useEffect(() => {
    if (!hasHydrated || !session) return;
    setRepName((prev) => (prev ? prev : session.repName));
    setShowName((prev) => (prev ? prev : session.showName));
  }, [hasHydrated, session]);

  const handleStart = () => {
    const result = repSessionSchema.safeParse({ repName, showName });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const nextErrors: { repName?: string; showName?: string } = {};
      if (fieldErrors.repName?.[0]) nextErrors.repName = fieldErrors.repName[0];
      if (fieldErrors.showName?.[0]) nextErrors.showName = fieldErrors.showName[0];
      setErrors(nextErrors);
      return;
    }
    setSession(result.data);
    // Pass session via URL params to avoid Zustand rehydration race on mobile Safari
    const params = new URLSearchParams({
      rep: result.data.repName,
      show: result.data.showName,
    });
    router.push(`/scan?${params.toString()}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-brand-50 via-white to-purple-50">
      <div className="w-full max-w-sm flex flex-col gap-6 animate-fade-up">
        {/* Logo / Hero */}
        <div className="text-center">
          <div className="text-5xl mb-3">🎪</div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            LeadSnap
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Scan cards. Capture leads. Close deals.
          </p>
        </div>

        <Card className="p-6 flex flex-col gap-5">
          <Input
            label="Your Name"
            icon="👤"
            placeholder="e.g. Sarah Johnson"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
            error={errors.repName}
            autoComplete="name"
          />
          <Input
            label="Show / Event"
            icon="🎪"
            placeholder="e.g. CES 2026"
            value={showName}
            onChange={(e) => setShowName(e.target.value)}
            error={errors.showName}
          />
          <Button
            size="lg"
            fullWidth
            disabled={!repName.trim() || !showName.trim()}
            onClick={handleStart}
          >
            Start Capturing →
          </Button>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Your name and show will be tagged on every lead you capture.
        </p>
      </div>
    </main>
  );
}
