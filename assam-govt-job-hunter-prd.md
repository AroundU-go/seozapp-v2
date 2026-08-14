# PRD — AI Job Hunter for Assam Govt Jobs
**Version:** 1.0
**Owner:** Ritom
**Status:** Ready for build (hand directly to coding agent)

---

## 1. One-line summary
A search-only web app where a user types what kind of Assam Government job they're looking for (role, department, qualification, district) and gets a clean, deduplicated, ranked list of live job postings pulled in real time from the web using **Exa** and **Tavily**, with no accounts, alerts, or notifications — pure search-and-browse.

## 2. Problem
Assam govt job info is scattered across dozens of sources (APSC, SSA Assam, Assam Police, DME, DHE, district recruitment cells, Sarkari Result-style aggregators, PDF notifications on gov.in domains). Candidates waste time manually checking each site. There is no single, fast, trustworthy search surface for this specific niche.

## 3. Goals
- Let a user search in natural language ("10th pass forest guard job Assam", "APSC CCE 2026 notification", "Nagaon district clerk vacancy") and get relevant, current results.
- Merge and de-duplicate results from Exa + Tavily into one ranked list.
- Show enough structured info per result (title, department, source domain, published/last-date if extractable, link) without needing to open every link.
- Fast (<3–4s perceived), simple, mobile-first, no login required for MVP.

## 4. Explicit non-goals (MVP)
- ❌ No email/SMS/push alerts or saved-search notifications.
- ❌ No user accounts required to search (optional anonymous session only if needed for rate-limiting).
- ❌ No resume matching / application filling.
- ❌ No scraping behind logins or CAPTCHAs.
- ❌ No payment/subscription in MVP.

## 5. Target user
Assam-based job seekers (government exam aspirants) searching from mobile, often on slow connections, moderate technical literacy. Assamese/English mixed reading ability — UI copy should be simple, minimal English.

---

## 6. Core user flow
1. User lands on a single search page (Google-like, one input box).
2. Optional filter chips below the box: **Department**, **Qualification level** (10th / 12th / Grad / PG / Any), **District**, **Job type** (Permanent / Contractual / Walk-in), **Posted within** (24h / 7d / 30d / Any).
3. User hits search → loading state → results list renders.
4. Each result card: Job title, Department/Board, District (if detected), Source domain badge, short AI-generated 1-line snippet, "Last date to apply" (if extractable), link opens source in new tab.
5. User can refine query or filters and re-search. No save, no alert, no login.
6. Optional: "Ask AI" follow-up box under results to refine ("only walk-in interviews", "only for women candidates") which re-runs search with the additional context folded into the query.

---

## 7. Tech architecture

Keep this consistent with your existing stack (Next.js App Router + TypeScript + Postgres) since you're already running that for your other SaaS project — no need for a separate backend for MVP scale.

```
Next.js 14+ (App Router, TypeScript)
 ├─ /app/page.tsx                  → search UI (client component)
 ├─ /app/api/search/route.ts       → orchestrates Exa + Tavily calls (server, edge or node runtime)
 ├─ /lib/providers/exa.ts          → Exa client wrapper
 ├─ /lib/providers/tavily.ts       → Tavily client wrapper
 ├─ /lib/merge.ts                  → dedup + rank + normalize results
 ├─ /lib/extract.ts                → lightweight LLM pass to extract structured fields (dept, last date, qualification) from title+snippet
 ├─ /lib/queryBuilder.ts           → builds provider-specific queries from user input + filters
 ├─ Postgres (optional MVP+1)      → cache table for recent queries + result sets (TTL-based), NOT required for MVP v0
 └─ Redis/Upstash (optional)       → short-lived query cache to cut API cost on repeat/similar searches
```

**No dedicated backend service needed** — Next.js API routes are sufficient since there are no background jobs, crons, or alerting to run. This is a stateless request/response search tool.

### Why both Exa and Tavily (dual-provider strategy)
- **Tavily**: strong at fresh, general web search with `topic`, `time_range`, `include_domains`/`exclude_domains`, and `include_answer` for a synthesized snippet. Good for broad "recent govt job notification" style queries and news-like recruitment announcements.
- **Exa**: neural/semantic search, good at matching intent ("jobs for someone with a diploma in electrical engineering in Assam") even when exact keywords don't match page text, and has `contents.highlights` for extracting the most relevant snippet from a page instead of a generic meta description.
- Running both in parallel and merging covers each other's blind spots (Tavily = fresher/keyword-strong, Exa = semantic-strong) and gives more resilient coverage of a fragmented, low-SEO-quality source set like district gov sites.

### Domain scoping (critical for relevance)
Both providers support domain include/exclude — hard-code a curated allowlist + a broader fallback:

**Primary trusted domains (always searched, higher weight in ranking):**
```
apsc.nic.in
assam.gov.in
dme.assam.gov.in
ssa.assam.gov.in
assampolice.gov.in
recruitment.assam.gov.in
employment.assam.gov.in (if live)
[relevant district .nic.in / .gov.in domains]
```

**Secondary aggregator domains (lower weight, still shown, useful for freshness):**
```
sarkariresult.com, freejobalert.com, employmentnews.gov.in, etc.
```

Implementation: two parallel calls per provider — one scoped to `include_domains` (primary list) and one open/general — then merge with primary-domain results ranked first.

### Query construction
`queryBuilder.ts` takes: raw user text + filters (department, qualification, district, job type, time window) and produces:
- A natural-language query string for Exa (semantic — keep it conversational, e.g. "Assam government forest guard recruitment 2026 10th pass").
- A keyword-leaning query string for Tavily + explicit `time_range`/`topic="news"` when "posted within" filter is set.
- Always append `"Assam"` and `"recruitment"` or `"vacancy"` or `"notification"` context tokens if the user's raw query doesn't already contain a govt-job signal word, to keep results on-topic.

### Result normalization + merge (`merge.ts`)
1. Fetch Exa and Tavily results in parallel (`Promise.allSettled` — one provider failing must not break the response).
2. Normalize both into a common shape:
```ts
type JobResult = {
  id: string;            // hash of URL
  title: string;
  url: string;
  sourceDomain: string;
  snippet: string;       // Tavily include_answer or Exa highlight
  publishedDate?: string;
  provider: 'exa' | 'tavily' | 'both';
  isTrustedDomain: boolean;
};
```
3. Dedup by normalized URL (strip query params/tracking) and by title similarity (simple fuzzy match, e.g. Jaccard on tokens > 0.85 = duplicate). If a URL/title appears from both providers, mark `provider: 'both'` and boost its rank.
4. Rank order: `isTrustedDomain` desc → `provider === 'both'` desc → `publishedDate` desc → provider relevance order.
5. Cap at ~20 results returned to UI; support "load more" pagination if needed later (MVP: single page of top 20 is fine).

### Structured field extraction (`extract.ts`) — optional but recommended
Run a single cheap LLM call (batched, one call for the whole result set, not per-result) that takes the merged list's titles+snippets and returns structured JSON per item: `{ department, qualificationLevel, district, lastDateToApply, jobType }` where confidently inferable, else null. This avoids needing to scrape/parse every PDF/page — it's a best-effort enrichment layer over search snippets only.

---

## 8. API design

### `POST /api/search`
**Request:**
```json
{
  "query": "10th pass forest guard job",
  "filters": {
    "department": null,
    "qualification": "10th",
    "district": null,
    "jobType": null,
    "postedWithin": "30d"
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "a1b2c3",
      "title": "Assam Forest Department Recruitment 2026 — Forest Guard",
      "url": "https://...",
      "sourceDomain": "assam.gov.in",
      "snippet": "Recruitment for 120 Forest Guard posts, 10th pass eligible...",
      "publishedDate": "2026-08-01",
      "provider": "both",
      "isTrustedDomain": true,
      "department": "Forest Department",
      "qualificationLevel": "10th",
      "district": null,
      "lastDateToApply": "2026-09-15",
      "jobType": "Permanent"
    }
  ],
  "meta": {
    "queryUsedExa": "...",
    "queryUsedTavily": "...",
    "totalBeforeDedup": 34,
    "totalAfterDedup": 19,
    "latencyMs": 2140
  }
}
```

Keep `meta` in response during dev for debugging; strip or hide behind a debug flag before shipping to users.

---

## 9. Environment variables
```
EXA_API_KEY=
TAVILY_API_KEY=
# optional if using batched extraction:
ANTHROPIC_API_KEY=   (or whichever LLM used for extract.ts)
# optional caching:
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 10. Provider call reference (for coding agent implementation)

**Tavily** — `POST https://api.tavily.com/search`
Key params to use: `query`, `search_depth` ("basic" default, "advanced" only if basic returns thin results — advanced costs more credits), `topic` ("general" or "news"), `time_range`, `include_domains`, `exclude_domains`, `include_answer: true` (for snippet), `max_results` (10–15 per call).

**Exa** — `POST https://api.exa.ai/search`
Key params: `query`, `type: "auto"` (let Exa pick neural vs keyword), `contents: { highlights: true }` for snippet extraction, `includeDomains`, `numResults` (10–15 per call), optional `startPublishedDate` for freshness filter matching the "posted within" UI filter.

Both calls should run with a hard timeout (~6s) and `Promise.allSettled` so a slow/failed provider degrades gracefully rather than blocking the whole response.

---

## 11. Caching & cost control
- Cache identical (query + filters) requests for 15–30 minutes in Redis/Upstash (or in-memory LRU for MVP v0) to avoid re-paying for both APIs on repeat searches — govt job postings don't change minute-to-minute.
- Rate-limit by IP (e.g. 20 searches/hour) to prevent abuse burning API credits, since there's no login gate.
- Log query volume + cache hit rate from day one so you can see real cost-per-search before scaling marketing.

## 12. UI/UX notes
- Single search bar, big, centered, mobile-first (most users will be on phones).
- Filter chips collapse into a "Filters" drawer on mobile.
- Empty state: show 4–5 example queries as tappable chips ("APSC exam 2026", "Assam Police constable", "10th pass jobs Guwahati", "Walk-in interview this week").
- Loading state: skeleton cards, not spinner — feels faster.
- No-results state: suggest broadening filters, never a dead end.
- Trusted-domain results get a small badge ("Official") so users trust the source over aggregator sites.

## 13. Non-functional requirements
- P95 response time target: under 5s including both provider calls + optional extraction pass.
- Must work acceptably on 3G/slow connections common in Assam — keep initial JS bundle small, avoid heavy client frameworks beyond Next.js defaults.
- No PII stored in MVP (no login = no user data at rest beyond anonymous rate-limit IP hashing).

## 14. Build phases
**Phase 0 (this PRD → MVP):**
Search page + `/api/search` route + Exa/Tavily parallel calls + merge/dedup/rank + basic result cards. No extraction, no caching, no filters beyond the query box.

**Phase 1:**
Add filter chips (department/qualification/district/time), domain trust weighting, in-memory query cache.

**Phase 2:**
Add batched LLM structured-field extraction (department/last date/qualification auto-tagging), Redis cache, rate limiting.

**Explicitly deferred / out of scope until asked for:**
Alerts, saved searches, accounts, resume upload/matching, admin dashboard, analytics beyond basic logging.

---

## 15. Open decisions for the coding agent to flag back (don't guess silently)
- Confirm final list of trusted Assam govt domains before hardcoding (the list above is a starting point, not verified exhaustive).
- Confirm whether Phase 0 needs Postgres at all — if not, skip it entirely and keep this fully stateless.
- Confirm LLM provider/model for the optional extraction pass in Phase 2.
