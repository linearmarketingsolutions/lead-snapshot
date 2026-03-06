# LeadSnap — Debug Context for Opus

## Current Problem
The app loads at localhost:3000 (and http://172.20.10.4:3000 on iPhone Safari).
The setup screen shows correctly with name + show name inputs.
Pressing "Start Capturing" refreshes the page instead of navigating to /scan.
This has been happening through multiple attempted fixes.

## What Has Been Tried
1. Original code used `<Link href="/scan" onClick={handleStartClick}>` — refreshed page
2. Replaced Link with `<button>` + `router.push('/scan')` — still refreshes
3. Tried `window.location.href = '/scan'` — still refreshes
4. Removed auth guards from /scan page — done
5. Removed (protected) folder structure — done
6. Removed NextAuth session requirement — done

## Current State of Key Files

### components/SetupOrSignIn.tsx
"use client"
- Uses useRouter from next/navigation
- Uses useLeadStore for setSession
- handleStartClick: validates form → setSession() → router.push('/scan')
- Button is a plain <button type="button"> with disabled prop
- No Link, no window.location

### app/page.tsx
- Server component
- Just renders <SetupOrSignIn /> with no props
- No auth() call

### app/scan/page.tsx
- "use client"
- No auth guards, no useEffect redirects
- Just renders <NavBar /> and <CardCapture />

### components/capture/CardCapture.tsx
- "use client"
- Has: if (!session) return null — THIS MAY BE THE PROBLEM
  If Zustand session is not persisting between page navigation,
  CardCapture returns null and shows blank screen
- session comes from useLeadStore((s) => s.session)

## Most Likely Root Cause
Zustand store uses localStorage persistence via zustand/middleware persist.
On mobile Safari, localStorage may not be available or the store may not
be rehydrating before CardCapture checks for session.

When router.push('/scan') fires, the new page mounts before Zustand
rehydrates from localStorage, so session is null, CardCapture returns
null, and the page appears blank or broken.

## The Fix Needed
Option A — Pass session via URL params:
- Add repName and showName as query params to router.push('/scan?rep=...&show=...')
- Read them in scan/page.tsx with useSearchParams
- Pass directly to CardCapture as props
- No dependency on Zustand rehydration timing

Option B — Fix Zustand rehydration:
- Use useLeadStore.persist.hasHydrated() to wait for rehydration
- Show loading spinner until hydrated
- Then check session

Option C — Use sessionStorage instead of localStorage:
- More reliable on mobile Safari for same-session data
- Change Zustand persist storage to sessionStorage

## Tech Stack
- Next.js 14 App Router
- TypeScript strict
- Zustand with persist middleware (localStorage)
- Tailwind CSS
- Anthropic SDK (server-side only in lib/anthropic.ts)
- Running on: npm run dev -- --hostname 0.0.0.0
- Testing on: iPhone Safari at http://172.20.10.4:3000

## What Still Needs to Be Built After Navigation is Fixed
1. Full scan flow: camera → extract → review → save
2. Google Sheets webhook integration (URL already configured in .env.local)
3. CSV export
4. Lead list / dashboard

## Google Sheets Webhook
Already set up and in .env.local:
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbwiMDLAamzmMGOaq8_apFc6rnjK3nyn3lOZ6mUwxtT0W199aoTnx6c4uujYUkZGpHcB/exec
Sheet ID: 1A7sHHNEI-0MW3Wq8i65sAdxkFCk-O-Ki1fG7oLFCbmw

## Conventions
- All Anthropic calls through lib/anthropic.ts only
- All API routes validate with Zod (schemas in lib/validators.ts)
- TypeScript strict — no any
- Components under 150 lines
- Never persist images to DB — use stripImages() from lib/utils.ts
