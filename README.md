# LeadSnap 🎪

**AI-powered tradeshow lead capture.** Snap a business card, get structured contact data in seconds, export to CSV, and eventually push straight to your CRM.

## Stack
- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** for styling
- **Zustand** for client state + localStorage persistence
- **Anthropic Claude** for vision-based card extraction (server-side only)
- **Zod** for runtime validation
- Deployed on **Vercel**

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-org/leadsnap.git
cd leadsnap
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# 3. Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | From [console.anthropic.com](https://console.anthropic.com) |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Optional | Google Apps Script webhook URL used by `POST /api/leads` |
| `GOOGLE_SHEETS_WEBHOOK_SECRET` | Optional | Shared secret for HMAC signature header `x-leadsnap-signature` |
| `DATABASE_URL` | Phase 2 | Postgres connection string |
| `NEXTAUTH_SECRET` | Phase 2 | Random 32-char secret |

## Deploy to Vercel

```bash
npx vercel
# Set ANTHROPIC_API_KEY in Vercel project settings → Environment Variables
```

## Roadmap

See [CONTEXT.md](./CONTEXT.md) for the full phase-by-phase development plan.

- **Phase 1** ✅ Card scanning, lead capture, CSV export
- **Phase 2** 🔲 Auth (NextAuth) + Database (Prisma/Supabase)
- **Phase 3** 🔲 CRM integration (HubSpot / Salesforce / Webhook)
- **Phase 4** 🔲 AI alignment scoring against ICP
- **Phase 5** 🔲 Multi-show dashboards + team analytics
