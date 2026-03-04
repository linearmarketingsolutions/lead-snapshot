"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLeadStore } from "@/hooks/useLeadStore";
import { CardCapture } from "@/components/capture/CardCapture";
import { NavBar } from "@/components/NavBar";

export default function ScanPage() {
  const router = useRouter();
  const session = useLeadStore((s) => s.session);

  // Guard — if no session, send back to setup
  useEffect(() => {
    if (!session) router.replace("/");
  }, [session, router]);

  if (!session) return null;

  return (
    <>
      <NavBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <CardCapture />
      </main>
    </>
  );
}
