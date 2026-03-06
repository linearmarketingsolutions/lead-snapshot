"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLeadStore } from "@/hooks/useLeadStore";
import { LeadList } from "@/components/leads/LeadList";
import { NavBar } from "@/components/NavBar";

export default function DashboardPage() {
  const router = useRouter();
  const hasHydrated = useLeadStore((s) => s.hasHydrated);
  const session = useLeadStore((s) => s.session);

  useEffect(() => {
    if (hasHydrated && !session) router.replace("/");
  }, [hasHydrated, session, router]);

  if (!hasHydrated || !session) return null;

  return (
    <>
      <NavBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <LeadList />
      </main>
    </>
  );
}
