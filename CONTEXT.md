# LeadSnap — Cursor Context & Dev Roadmap

## What This Is
LeadSnap is a mobile-first PWA for tradeshow lead capture. Reps take a photo of a business card (front + optional back), Claude Vision extracts the contact info, the rep reviews/edits, adds notes and an alignment score, then saves. All leads export to CSV. Built to eventually connect to a CRM.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + CSS Modules for complex components
- **State**: Zustand (client-side lead store with persistence)
- **AI**: Anthropic SDK (`@anthropic-ai/sdk`) — server-side only, never exposed to client
- **Validation**: Zod (API schemas + form validation)
- **Auth**: NextAuth.js — NOT YET IMPLEMENTED (see Phase 2)
- **Database**: NOT YET IMPLEMENTED (see Phase 2) — currently in-memory/localStorage
- **Deployment**: Vercel (Edge-compatible)

## Project Structure
```
/app
  /api/extract-card     → POST — server action, calls Anthropic Vision API
  /dashboard            → Leads list page
  /scan                 → Camera/upload + review flow
  layout.tsx            → Root layout, providers
  page.tsx              → Setup / onboarding screen

/components
  /ui                   → Design system primitives (Button, Input, Badge, Card, Spinner)
  /capture              → CardCapture, CardReview components
  /leads                → LeadCard, LeadList, LeadSearch, CSVExport

/hooks
  useLeadStore.ts       → Zustand store for leads (add, clear, search, export)
  useCardScanner.ts     → Handles image capture, API call orchestration, state machine

/lib
  anthropic.ts          → Anthropic client (server-only)
  csv.ts                → CSV generation utility
  validators.ts         → Zod schemas for Lead, CardExtraction, API payloads

/types
  index.ts              → Lead, Rep, Show, ExtractedCard, AlignmentScore types
```

## Data Model
```typescript
// See /types/index.ts for full definitions
Lead {
  id: string (uuid)
  repName: string
  showName: string
  capturedAt: ISO string
  name: string
  title: string
  company: string
  email: string
  phone: string
  linkedin: string
  alignmentScore: number | null  // 1-10, nullable — added post-capture
  notes: string
  cardImageFront?: string        // base64, strip before persisting to DB
  cardImageBack?: string         // base64, strip before persisting to DB
}
```

## API Routes
### POST /api/extract-card
- **Auth**: None yet (add API key header in Phase 2)
- **Input**: `{ frontImage: base64string, backImage?: base64string }`
- **Output**: `{ name, title, company, email, phone, linkedin }`
- **Security**: Images are processed server-side only. Never stored. Anthropic API key never exposed to client.
- **Rate limiting**: TODO — add Vercel KV + upstash ratelimit in Phase 2
- **Max payload**: 10MB (images compressed client-side before sending)

## Environment Variables
```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Phase 2 — not yet needed
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## ✅ Phase 1 — COMPLETE (current state)
- [x] Setup screen (rep name + show name)
- [x] Card capture (front + optional back, iPhone camera)
- [x] Server-side Claude Vision extraction
- [x] Review & edit extracted fields
- [x] Notes + alignment score
- [x] Zustand lead store (in-memory, resets on refresh)
- [x] CSV export
- [x] Lead list with search
- [x] Mobile-first responsive UI
- [x] Zod validation on API route
- [x] TypeScript strict mode

---

## 🔲 Phase 2 — Auth + Persistence (NEXT TO BUILD)

### 2a. Database (Supabase or PlanetScale recommended)
- [ ] Add `prisma` + schema for `leads`, `reps`, `shows`
- [ ] `useLeadStore` → persist to DB on save instead of memory
- [ ] Leads survive page refresh, shared across team

### 2b. Auth (NextAuth.js)
- [ ] Google SSO for internal team login
- [ ] Rep sessions — rep name auto-populated from auth profile
- [ ] Route protection on `/scan` and `/dashboard`

### 2c. Rate Limiting
- [ ] Add `@upstash/ratelimit` on `/api/extract-card`
- [ ] 60 requests/hour per IP (tradeshow pace is ~1/min)

### 2d. Image Compression
- [ ] Add `browser-image-compression` before sending to API
- [ ] Target: <500KB per image (Anthropic handles up to 5MB)

---

## 🔲 Phase 3 — CRM Integration

### Option A: HubSpot
- [ ] `POST /api/crm/hubspot` — create contact from Lead
- [ ] Map fields: name→firstname+lastname, company→company, email→email, phone→phone, notes→hs_note_body
- [ ] OAuth flow for user's HubSpot account

### Option B: Salesforce
- [ ] `POST /api/crm/salesforce` — create Lead object
- [ ] Use jsforce SDK
- [ ] Connected App OAuth

### Option C: Generic Webhook
- [ ] `POST /api/crm/webhook` — POST lead JSON to user-configured URL
- [ ] Useful for Zapier/Make.com integrations
- [ ] Add webhook URL to settings

---

## 🔲 Phase 4 — Alignment Score Intelligence
- [ ] Add "Ideal Customer Profile" config screen (company size, industry, role, tech stack)
- [ ] On card capture, auto-score 1-10 based on ICP match using Claude
- [ ] Prompt: analyze extracted card vs ICP criteria, return score + 1-sentence rationale
- [ ] Store rationale alongside score in Lead

---

## 🔲 Phase 5 — Team + Multi-Show
- [ ] Show management (create, archive, switch active show)
- [ ] Per-show lead dashboards
- [ ] Team analytics (leads per rep, avg alignment score, capture rate by hour)
- [ ] Export: per-show CSV, per-rep CSV, full export

---

## Cursor Instructions

### To add a new field to leads:
1. Update `Lead` type in `/types/index.ts`
2. Update `leadSchema` in `/lib/validators.ts`
3. Add field to `LeadReview` component
4. Add column to CSV export in `/lib/csv.ts`

### To add a CRM integration:
1. Create `/app/api/crm/[provider]/route.ts`
2. Add `CRMProvider` type to `/types/index.ts`
3. Add connect button to dashboard settings panel
4. Map Lead fields to provider schema

### To change the AI model or prompt:
- Edit `/lib/anthropic.ts` — `extractCardPrompt` and `EXTRACTION_MODEL` constant

### To add the ICP alignment scorer:
- Add `scoreLead(lead: Lead, icp: ICP): Promise<AlignmentResult>` to `/lib/anthropic.ts`
- Call after card review confirmation, before saving to store

### Key conventions:
- All Anthropic calls go through `/lib/anthropic.ts` — never call the SDK directly from components
- All API routes validate input with Zod before processing
- Images are never persisted — strip `cardImageFront/Back` before any DB write
- Keep components under 150 lines — split if larger
- Use `server-only` package in any file that touches secrets
