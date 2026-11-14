# CivicVoice

Community intelligence platform for Towson, MD — connecting Towson University students, faculty, and local residents to surface issues, vote on priorities, and hold institutions accountable.

Built as a demonstration/prototype. All data shown in the interface is clearly labeled as demo data and does not represent real votes, statistics, or institutional responses.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Server Components, Server Actions) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + tailwindcss-animate |
| UI Components | [Radix UI](https://www.radix-ui.com/) primitives + custom components |
| Icons | [Lucide React](https://lucide.dev/) |
| Charts | [Recharts](https://recharts.org/) |
| Map | [MapLibre GL JS](https://maplibre.org/) v4.7.1 |
| Database & Auth | [Supabase](https://supabase.com/) (PostgreSQL + Realtime + Storage) |
| QR Codes | [qrcode.react](https://github.com/zpao/qrcode.react) |
| Date Utilities | [date-fns](https://date-fns.org/) |

---

## Pre-existing APIs & Services

### MapTiler
- **Used for:** Premium dark map tile rendering (MapTiler Dataviz Dark style)
- **Key:** `NEXT_PUBLIC_MAPTILER_KEY` (public, safe to expose in browser)
- **Free tier:** Available at [maptiler.com](https://www.maptiler.com/cloud/)
- **Fallback:** App automatically falls back to dark-filtered OpenStreetMap tiles if no key is provided

### Supabase
- **Used for:** PostgreSQL database (issue submissions, votes), Realtime subscriptions (live vote counts, live messages), File Storage (issue photo uploads)
- **Keys:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, protected by Row Level Security policies)
- **Demo mode:** App runs fully in demo mode with local sample data if Supabase keys are not configured

### OpenRouter (AI features)
- **Used for:** "Connected Organizations" feature on issue detail pages — matches community issues to relevant local institutions and organizations
- **Key:** `OPENROUTER_API_KEY` (server-side only, never exposed to browser)
- **Fallback:** Returns pre-built static organization data per category if the key is missing or the request fails
- **Model:** Routes to available models via [openrouter.ai](https://openrouter.ai/)

### Google Favicon API
- **Used for:** Organization logo thumbnails in the Connected Organizations widget
- **No key required:** Public, unauthenticated endpoint (`https://www.google.com/s2/favicons?domain=...`)

### Unsplash
- **Used for:** Demo issue photos shown on issue detail pages
- **No key required:** Direct image URLs using Unsplash's public CDN — these are demonstration assets only
- **Note:** In production, user-submitted images would be stored in Supabase Storage

---

## Running Locally

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in keys in .env.local

# Start development server (binds to 0.0.0.0 for local network access)
npm run dev
```

The app runs in full demo mode without any API keys configured. Add keys incrementally to unlock live database, map tiles, and AI features.

---

## Environment Variables

See `.env.example` for the full list. No keys are required to run the demo.

```
NEXT_PUBLIC_MAPTILER_KEY     # Map tiles (optional, has fallback)
NEXT_PUBLIC_SUPABASE_URL     # Database + Realtime (optional, has fallback)
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENROUTER_API_KEY           # AI org matching (optional, has fallback)
```

---

## Key Features

- **Issue Map** — Interactive GeoJSON cluster map of community issues across Towson
- **Community Voting** — Anonymous upvoting with live Supabase Realtime updates
- **Trending Issues** — Algorithm-ranked by votes-per-day on the homepage
- **Presenter / Live Mode** — Full-screen presenter view at `/live/[issueId]` with animated vote counter, QR code, and live audience messages
- **Mobile Voting** — Scannable QR code links to `/join/[issueId]` for phone-based voting and live messaging
- **Proposals** — Community-driven solution proposals linked to issues
- **Accountability Tracker** — Documented institutional responses with status tracking
- **Connected Organizations** — AI-matched organizations relevant to each issue's category and location
- **Admin Dashboard** — Overview of platform activity, charts, geographic distribution
- **Institution Directory** — Grouped listing of universities, government agencies, and community orgs

---

*Demo data is fictional and created solely to illustrate the platform's capabilities. No real personal information, votes, or institutional commitments are represented.*
