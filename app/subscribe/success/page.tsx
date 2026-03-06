"use client";

import Link from "next/link";

export default function SubscribeSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-green-50 via-white to-brand-50">
      <div className="max-w-sm w-full text-center flex flex-col gap-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-extrabold text-slate-900">You&apos;re in!</h1>
        <p className="text-slate-500">
          Your LeadSnap subscription is active. Time to start capturing leads.
        </p>
        <Link
          href="/"
          className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition-all"
        >
          Start Capturing →
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-400 underline">
          View your dashboard
        </Link>
      </div>
    </main>
  );
}
