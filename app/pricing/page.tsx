"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for solo reps at 1–2 shows per year",
    features: [
      "Unlimited card scans",
      "AI-powered contact extraction",
      "CSV export",
      "1 active show at a time",
      "Mobile-first PWA",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || "price_starter",
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "For teams and reps working multiple shows",
    features: [
      "Everything in Starter",
      "Unlimited shows",
      "Team members (up to 5)",
      "Alignment scoring",
      "CRM webhook export",
      "Priority support",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_pro",
    cta: "Start Free Trial",
    highlight: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(planName);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-500">
            Start free for 14 days. No credit card required.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col gap-6 border-2 ${
                plan.highlight
                  ? "bg-white border-brand-500 shadow-xl"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              {plan.highlight && (
                <div className="inline-flex self-start bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
              </div>

              <ul className="flex flex-col gap-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.priceId, plan.name)}
                disabled={loading === plan.name}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  plan.highlight
                    ? "bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                    : "bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50"
                }`}
              >
                {loading === plan.name ? "Loading..." : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Questions? Email us at{" "}
          <a href="mailto:hello@leadsnap.app" className="underline">
            hello@leadsnap.app
          </a>
        </p>
      </div>
    </main>
  );
}
