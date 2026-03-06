"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLeadStore } from "@/hooks/useLeadStore";
import { CardCapture } from "@/components/capture/CardCapture";
import { NavBar } from "@/components/NavBar";

function ScanPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHydrated = useLeadStore((s) => s.hasHydrated);
  const session = useLeadStore((s) => s.session);
  const setSession = useLeadStore((s) => s.setSession);

  // Accept session from URL params (fixes mobile Safari Zustand rehydration race)
  useEffect(() => {
    const rep = searchParams.get("rep");
    const show = searchParams.get("show");
    if (rep && show) {
      setSession({ repName: rep, showName: show });
    }
  }, [searchParams, setSession]);

  // Guard — if no session after hydration and no URL params, send back to setup
  useEffect(() => {
    const rep = searchParams.get("rep");
    if (hasHydrated && !session && !rep) router.replace("/");
  }, [hasHydrated, session, router, searchParams]);

  const activeSession =
    session ||
    (searchParams.get("rep") && searchParams.get("show")
      ? { repName: searchParams.get("rep")!, showName: searchParams.get("show")! }
      : null);

  if (!activeSession) return null;

  return (
    <>
      <NavBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <CardCapture />
      </main>
    </>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={null}>
      <ScanPageInner />
    </Suspense>
  );
}
