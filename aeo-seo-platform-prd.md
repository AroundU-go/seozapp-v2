# Product Requirements Document
## AI-Search Visibility Platform (SEO + AEO/GEO Tracking)

**Prepared for:** Coding agent (implementation-ready spec)
**Status:** V1 build — 4 core modules
**Stack assumption:** Next.js (App Router) + TypeScript + Postgres, following the FireGEO reference architecture (github.com/firecrawl/firegeo) for auth/billing/monitoring scaffolding. Adjust if the agent's environment differs, but keep the module boundaries below.

---

## 0. Context for the agent

Before writing code:
1. Fetch and read `https://docs.firecrawl.dev/llms.txt` (Firecrawl's own docs index) and confirm current endpoint names/params for: `scrape`, `crawl`, `map`, `batch scrape`, `search`, and any `llmstxt`/`extract` endpoints. **Do not assume endpoint shapes from training data — verify against live docs**, since Firecrawl's API surface changes.
2. Fetch and read the Kimi (Moonshot AI) API docs(https://platform.kimi.ai/docs/api/overview) for current chat completion endpoint, auth, rate limits, and context window, since usage here is high-volume (many scheduled prompt calls).
3. Optionally clone `github.com/firecrawl/firegeo` locally as a reference for the brand-monitoring / prompt-testing module — it solves a very similar problem (tracking brand mentions across AI answers) and its schema/UI patterns can be adapted rather than reinvented. Do not copy license-incompatible code verbatim if the target repo has different licensing needs — check FireGEO's license first.

---
## API KEYS:

1. Kimi api key: sk-2eg8WF6qITVTNAyOlJgE5JI8NHn3JUnWyj1PoWMKjPP5z9sA
2. supabase project url: https://ilmmqkfcotrmjjqbawhg.supabase.co
3. Supabase Anon Public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbW1xa2Zjb3RybWpqcWJhd2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTYwODQsImV4cCI6MjA4Njc5MjA4NH0.WiC981b2OZghhJ4Wj7rBSSN4k2dpGla-mG8EfQwqteE 
4. Supabase service role secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbW1xa2Zjb3RybWpqcWJhd2hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTIxNjA4NCwiZXhwIjoyMDg2NzkyMDg0fQ.N-26TMvNNd6kztHAn_4ZxoqLNnd2WbjsGdIqvG_fHCA
5. Firecrawl API key: fc-02bba4b621014e4389d9e9869968307e


## 1. Product summary

A SaaS platform that helps businesses/agencies understand and improve their visibility in both traditional search (SEO) and AI-generated answers (AEO/GEO — Answer Engine Optimization / Generative Engine Optimization). V1 ships four modules:

1. **SEO Tracking** — ongoing technical/on-page SEO monitoring for a tracked domain.
2. **AI Citation + Prompt Monitoring** — scheduled prompts run against LLMs to detect whether/how a brand or domain is cited, with trend tracking.
3. **Bulk Crawl + AI Readiness Score** — crawl a whole site (up to thousands of pages) and score each page/domain on "AI readiness" (how easily an LLM/answer engine can parse, cite, and quote it).
4. **Competitor SEO/AEO Analysis** — run the same technical + AI-readiness analysis against 1–N competitor domains and produce comparative gap reports.

Deferred to Phase 2 (do not build now, but leave clean extension points): llms.txt generator, AEO content rewriter.

---

## 2. Goals & non-goals

**Goals**
- Let a user add a domain (+ optional competitor domains) and get a recurring, trackable picture of SEO health and AI-answer visibility.
- Make "AI readiness score" a defensible, explainable, reproducible metric — not a black box number.
- Support scale: bulk crawls of thousands of URLs without blocking the UI or timing out requests (must be job-based/async).
- Keep Firecrawl and Kimi calls behind a service abstraction layer so either provider can be swapped later.

**Non-goals (V1)**
- No llms.txt generation UI/API yet (stub the interface only).
- No automated content rewriting yet (stub the interface only).
- No multi-LLM-engine monitoring beyond Kimi in V1 (design the schema to support multiple engines later, e.g. adding ChatGPT/Claude/Perplexity as rows, but only implement Kimi now).
- No white-label/agency multi-tenant branding in V1 (basic multi-tenant data isolation is fine, branding is not).

---

## 3. Users & core workflows

**Primary user:** solo founder / small agency doing SEO+AEO audits for their own site or client sites.

**Core workflow:**
1. Sign up → create a Workspace.
2. Add a tracked Domain (their own site).
3. Optionally add up to N Competitor Domains under that Workspace.
4. Configure a set of Monitoring Prompts (natural-language questions a customer might ask an AI assistant that should surface this brand, e.g. "best project management tool for small teams").
5. Trigger (or schedule) a Crawl Job for the domain (and competitors).
6. View dashboards: SEO health, AI Readiness Score (per page + domain aggregate), Citation Monitoring results over time, Competitor comparison.
7. Get alerted (in-app, minimum; email optional) when: readiness score drops, a competitor gets newly cited where the user isn't, or a technical SEO issue appears.

---

## 4. Module specs

### 4.1 SEO Tracking

**Purpose:** ongoing technical + on-page SEO snapshot of the tracked domain.

**Data to extract per page (via Firecrawl scrape/crawl):**
- Title tag, meta description, canonical URL
- H1–H3 structure (presence, count, hierarchy correctness)
- Word count, content-to-HTML ratio if available
- Internal link count / outbound link count
- Image alt-text coverage
- Structured data / schema.org presence (type + validity)
- Status code, redirect chains, broken internal links
- Robots meta / robots.txt directives, sitemap presence

**Functional requirements:**
- FR-1.1: User can trigger a full-domain crawl or a single-URL scrape.
- FR-1.2: Each crawl run is versioned (store as a snapshot tied to `crawl_run_id`) so historical comparison is possible.
- FR-1.3: System diffs the latest snapshot against the previous one and surfaces "what changed" (new/removed pages, title changes, broken links appearing/disappearing).
- FR-1.4: User can schedule recurring crawls (daily/weekly) per domain.
- FR-1.5: Dashboard shows a domain-level SEO health score (rule-based, e.g. weighted composite of the above signals — define exact weights in `/lib/scoring/seo-score.ts` so they're editable, not hardcoded inline).

### 4.2 AI Citation + Prompt Monitoring

**Purpose:** detect whether/how the brand/domain is mentioned when relevant prompts are put to an LLM, tracked over time.

**Functional requirements:**
- FR-2.1: User can create/edit a list of Monitoring Prompts per workspace (free text, e.g. "top CRM tools for startups").
- FR-2.2: User can tag each prompt with an intent category (e.g. comparison, recommendation, how-to) for later filtering.
- FR-2.3: On a schedule (default daily, configurable) OR on-demand, the system sends each prompt to the Kimi API and captures the full response text.
- FR-2.4: System parses each response for:
  - Whether the tracked brand/domain is mentioned (boolean)
  - Whether any competitor domain is mentioned (boolean, per competitor)
  - Approximate position/prominence (e.g. mentioned in first 3 sentences vs buried, or ranked position if the answer is a list)
  - Sentiment of the mention (positive/neutral/negative) — use Kimi itself as a second pass classifier on its own or a fresh completion, don't try to regex this
- FR-2.5: Store every raw response (for audit/debugging) plus the parsed structured result.
- FR-2.6: Trend view: per prompt, per week, citation rate (% of runs where brand was mentioned) as a time series.
- FR-2.7: Alert when a previously-citing prompt stops citing the brand, or starts citing a new competitor.

**Design note for the agent:** build the "ask LLM → parse mention → store" pipeline as a provider-agnostic interface (`LLMProvider.query(prompt): RawResponse`) even though only Kimi is implemented, so a second engine can be added later without refactoring the pipeline.

### 4.3 Bulk Crawl + AI Readiness Score at Scale

**Purpose:** crawl an entire site (hundreds–thousands of URLs) and produce a per-page and per-domain "AI Readiness Score."

**Functional requirements:**
- FR-3.1: User can kick off a bulk crawl of a domain (must use Firecrawl's crawl/batch endpoint, not one-by-one scrape, for scale/cost reasons — confirm current batch limits in Firecrawl docs).
- FR-3.2: Crawl runs as a background job (queue-based — e.g. a job table + worker, or a queue service if the environment has one). UI shows job progress (pages crawled / total discovered), not a blocking spinner.
- FR-3.3: For each page, compute an **AI Readiness Score** (0–100) from a defined rubric combining:
  - *Structural signals* (rule-based, cheap): clear H1, logical heading hierarchy, presence of direct-answer paragraphs near the top, FAQ/Q&A formatting, presence of lists/tables, schema.org markup, content length sufficiency.
  - *Semantic signals* (LLM-based, via Kimi, sampled — not every page needs an LLM call if traffic/cost is a concern): does the page directly and unambiguously answer an implied question, is the content self-contained enough to be quoted out of context, is it free of heavy fluff/marketing-speak that buries the answer.
  - Store the two subscores separately (`structural_score`, `semantic_score`) plus a weighted `overall_score`, and store *why* — a short list of specific issues found per page — not just the number.
- FR-3.4: Domain-level aggregate score = weighted rollup of page scores (weight by page importance if determinable — e.g. pages in sitemap / high internal-link-count weighted higher; otherwise simple average, documented clearly which mode is active).
- FR-3.5: Sortable/filterable page-level table (worst-scoring pages first) so users can prioritize fixes.
- FR-3.6: Rate/cost control: cap LLM semantic scoring calls per crawl (configurable, default e.g. sample 20% of pages or top N by traffic/internal links) to avoid runaway Kimi API cost on large crawls — this must be explicit and visible to the user, not silent.

### 4.4 Competitor SEO/AEO Analysis

**Purpose:** run the same crawl + scoring pipeline against competitor domains and produce a comparison.

**Functional requirements:**
- FR-4.1: User can add competitor domains to a workspace (reuse the same crawl + scoring pipeline from 4.3 — do not duplicate logic).
- FR-4.2: Comparison dashboard: side-by-side AI Readiness Score (own vs each competitor), SEO health score, and citation rate (from module 4.2, for prompts where competitor mentions are being tracked).
- FR-4.3: **Content gap analysis**: compare topic/URL coverage between own site and competitor(s) — list topics/pages the competitor has that the user's site doesn't (based on crawled page titles/headings/topics, clustered via Kimi if needed).
- FR-4.4: **Structural gap analysis**: highlight specific structural/semantic patterns competitors do better (e.g. "Competitor X uses FAQ schema on 80% of blog posts, you use it on 5%").
- FR-4.5: Exportable summary (PDF or shareable report page) suitable for a client-facing agency deliverable.

---

## 5. Data model (draft — adjust naming to project conventions, but keep these entities)

```
Workspace
  id, name, owner_user_id, created_at

Domain
  id, workspace_id, url, is_competitor (bool), added_at

CrawlRun
  id, domain_id, started_at, finished_at, status, pages_discovered, pages_crawled, source (manual|scheduled)

Page
  id, crawl_run_id, domain_id, url, status_code, title, meta_description,
  h1_count, heading_structure_json, word_count, schema_types_json,
  internal_links_count, broken_links_json, raw_markdown_ref, extracted_at

PageScore
  id, page_id, structural_score, semantic_score, overall_score, issues_json, scored_at

MonitoringPrompt
  id, workspace_id, prompt_text, intent_tag, is_active, created_at

PromptRun
  id, prompt_id, run_at, llm_provider, raw_response_text,
  brand_mentioned (bool), competitor_mentions_json, position_estimate, sentiment

Alert
  id, workspace_id, type, payload_json, created_at, read_at
```

---

## 6. External API integration layer

Build a `/lib/providers/` abstraction with two clients:

**`firecrawlClient`**
- `scrapeUrl(url)` — single page → markdown + metadata
- `crawlDomain(url, options)` — kicks off async crawl job, returns job id
- `getCrawlStatus(jobId)` / `getCrawlResults(jobId)`
- `mapDomain(url)` — URL discovery only (cheaper, use before deciding crawl scope)
- Confirm current method names/params against `https://docs.firecrawl.dev/llms.txt` before implementing — do not hardcode from assumption.

**`kimiClient`**
- `complete(prompt, options)` — basic chat completion
- Used both for (a) prompt-monitoring queries and (b) semantic readiness scoring and (c) gap-analysis summarization
- Implement retry/backoff and token-usage logging (this will be called at volume — cost visibility matters)

Both clients read API keys from env vars (`FIRECRAWL_API_KEY`, `KIMI_API_KEY`), never hardcoded, never client-side exposed.

---

## 7. Non-functional requirements

- **Async by default:** any operation that crawls >5 pages or makes >5 LLM calls must run as a background job, not inline in an HTTP request.
- **Cost visibility:** every module that calls Kimi must log token usage per run and show a running cost estimate in the UI (even approximate).
- **Explainability:** every score (SEO health, AI readiness, structural, semantic) must be traceable to the specific signals that produced it — no opaque single numbers without a breakdown view.
- **Idempotency:** re-running a crawl for the same domain should create a new versioned `CrawlRun`, never overwrite history.
- **Rate limiting:** respect Firecrawl and Kimi rate limits; queue rather than fire-and-hope on bulk operations.

---

## 8. Build phases (suggested order for the agent)

1. **Scaffold:** auth, workspace/domain CRUD, Firecrawl + Kimi client wrappers with env config.
2. **Module 4.1 (SEO Tracking):** single-domain crawl → snapshot → score → diff view. This validates the whole crawl→store→display pipeline end to end on the simplest module.
3. **Module 4.3 (Bulk Crawl + AI Readiness):** extend the pipeline to job-queue scale, add structural + semantic scoring.
4. **Module 4.4 (Competitor Analysis):** reuse 4.3's pipeline against competitor domains, add comparison views.
5. **Module 4.2 (Citation/Prompt Monitoring):** separate pipeline (LLM-query based, not crawl-based), trend dashboard, alerting.
6. **Cross-cutting:** alerts, scheduling, cost dashboards, polish.

Do not build all four modules in parallel — 4.1 exists specifically to de-risk the crawl pipeline before it's asked to run at bulk scale.

---

## 9. Landing Page & Theme — Build Prompt

**Design system source:** "Steep" — serif editorial analytics theme, light mode, near-monochrome canvas with a single warm peach accent. Full token reference below; the agent should treat this as the binding style guide, not a starting point to deviate from.

### 9.1 Theme setup (do this first, before any page content)

Implement the design system as reusable tokens before building any component:

- Install/declare fonts: **Signifier** (serif, display/headings only, weight 400 exclusively — never bold) and **Söhne** (sans, everything else, using the half-step weights 430/450/480/500). If neither font is licensed/available, fall back to `Source Serif 4` for Signifier and `Inter` for Söhne, but keep the exact size/weight/letter-spacing scale unchanged.
- Set up the full CSS custom property / Tailwind v4 `@theme` block exactly as specified in the token reference (Section 9.4) — colors, type scale, spacing scale, radii, shadows, layout constants. Do not invent additional colors, radii, or shadow values outside this set.
- Global rules to bake in at the theme level, not per-component:
  - Buttons: `border-radius: 9999px` always.
  - Cards: `border-radius: 24px` (or the named variant — `16px` for small cards, `20px` for elevated/floating cards).
  - No drop shadows on content cards (Neutral Card, Accent Peach Card) — shadow is reserved exclusively for Floating Product Artifacts, Modals, and Dropdowns.
  - Signifier is used only at 44px / 64px / 90px, only for H1/H2, always weight 400.
  - The peach accent (`#fbe1d1`) appears **at most once per page** as an editorial callout — never as a repeating pattern, never as a section background, never under a colored (non-white) surface.
  - Sienna Brown (`#5d2a1a`) is only ever used as text/stroke on peach surfaces or as chart line color — never as body text on white.

### 9.2 Landing page structure

Build a single marketing landing page for this product (an AI-search visibility platform combining SEO tracking, AI citation monitoring, bulk AI-readiness scoring, and competitor SEO/AEO analysis) using the Steep component library. Section order:

1. **Nav** — transparent top bar, no background/border/shadow. Logo left, links center (`Product`, `Pricing`, `How it works`, `Resources`), CTAs right: one Text Link (`Log in`) + one filled Pill Button (`Get started`).
2. **Hero** — centered oversized Signifier headline at 90px, one phrase mid-sentence italicized (e.g. "See how AI actually *answers* for your brand"), Söhne 17px subhead below in Slate Gray explaining the product in one sentence. Below that: filled Pill Button (`Start free audit`) + ghost Pill Button (`See a sample report`) side by side. Surround the headline with 3–4 Floating Product Artifact cards at varied offsets — use these specific fragments, since they map to real product screens: (a) an AI Readiness Score card with a radial ring + score number, (b) a Citation Monitoring stat card showing a mention-rate line chart with a delta ("↑ mentioned in 62% of tested prompts"), (c) a small competitor comparison table fragment (3 rows: You / Competitor A / Competitor B with score columns), (d) an AI composer input styled like the "Ask anything…" pattern but placeholder-texted as `Ask which AI answers cite you…`.
3. **Logos/proof strip** (optional, only if real logos exist — otherwise skip, don't fabricate customer names).
4. **Feature section — SEO Tracking** — Section Fog (`#fafafb`) background, Signifier 64px section title, Söhne 18px subhead, 2-column layout: text (what it does, 3 bullet-style Tag/Category-labeled points) + a Floating Product Artifact showing a mock SEO health score trend.
5. **Feature section — AI Citation + Prompt Monitoring** — Paper White background, same 2-column pattern, artifact shows a prompt list with citation-rate badges per prompt.
6. **Feature section — Bulk Crawl + AI Readiness Score** — Section Fog background, artifact shows a sortable "worst-scoring pages" table fragment (3 visible rows).
7. **Feature section — Competitor SEO/AEO Analysis** — Paper White background, artifact shows a side-by-side score comparison bar/table.
8. **Editorial accent card** — one Accent Peach Card, placed on a Paper White section, containing a single pull-quote-style customer benefit statement (placeholder copy if no real customer exists yet — mark clearly as placeholder in a code comment) — this is the one permitted use of the peach surface on the page.
9. **Pricing section** — Signifier 64px title ("Pricing"), 3-column grid of Neutral Cards (Starter / Growth / Agency), each using: Söhne 20px weight 500 plan name, Signifier or large Söhne price, a short feature list (Tag-style, no checkmarn icons unless added as a minimal ghost icon), and a Pill Button CTA per card (filled on the recommended/Growth tier, ghost on the others).
10. **How it works** — 3–4 step horizontal or vertical sequence using Neutral Cards, each step a number + short Söhne body text.
11. **Final CTA band** — Ink Black or Paper White background (not peach), centered Signifier 64px headline, one filled Pill Button.
12. **Footer** — Slate Gray text on Paper White, simple link columns, no heavy borders — hairline top border only if needed for separation.

### 9.3 Explicit constraints for the agent

- Single-file or component-per-section, whichever matches the project's existing frontend-design conventions — but every section must consume the theme tokens, never hardcoded hex values inline.
- No stock photography, no illustration, no abstract graphic elements — imagery is exclusively product-UI fragments (per Section "Imagery" in the token reference), consistent with the floating-artifact pattern.
- Keep the page achromatic except the single peach accent card — if the agent finds itself wanting a second color (e.g. a green "success" badge on the readiness score), map it to the existing palette instead (e.g. Ink Black + Sienna Brown) or flag the conflict rather than silently introducing a new hue.
- Responsive behavior isn't specified in the token reference — default to standard mobile-first breakpoints, but preserve the hero's floating-artifact collage as a stacked (non-overlapping) layout below ~768px rather than trying to force the desktop overlap composition onto small screens.
- Before writing code, read `/mnt/skills/public/frontend-design/SKILL.md` (or equivalent) for the project's general frontend conventions, and reconcile with the Steep-specific rules above — Steep rules win on anything token/style-specific (colors, type, radii, shadow); the general skill wins on things Steep doesn't specify (e.g. component file structure, state management).

### 9.4 Token reference (binding — do not deviate)

```css
:root {
  /* Colors */
  --color-ink-black: #17191c;
  --color-paper-white: #ffffff;
  --color-mist-gray: #f2f2f3;
  --color-fog-white: #fafafb;
  --color-slate-gray: #777b86;
  --color-ash-gray: #979799;
  --color-smoke-gray: #a3a6af;
  --color-blush-peach: #fbe1d1;
  --color-sienna-brown: #5d2a1a;

  /* Typography — Font Families */
  --font-signifier: 'Signifier', ui-serif, Georgia, 'Source Serif 4', serif;
  --font-sohne: 'Sohne', 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Typography — Scale */
  --text-caption: 15px;      --leading-caption: 1.5;
  --text-body: 17px;         --leading-body: 1.35;
  --text-body-lg: 20px;      --leading-body-lg: 1.35;
  --text-subheading: 22px;   --leading-subheading: 1.5;
  --text-heading-sm: 26px;   --leading-heading-sm: 1.18; --tracking-heading-sm: -0.23px;
  --text-heading: 44px;      --leading-heading: 1.3;     --tracking-heading: -0.66px;
  --text-heading-lg: 64px;   --leading-heading-lg: 1.3;  --tracking-heading-lg: -0.96px;
  --text-display: 90px;      --leading-display: 1.3;     --tracking-display: -2.25px;

  /* Weights */
  --font-weight-regular: 400;
  --font-weight-w430: 430;
  --font-weight-w450: 450;
  --font-weight-w480: 480;
  --font-weight-medium: 500;

  /* Spacing (4px base unit) */
  --spacing-4: 4px;   --spacing-8: 8px;   --spacing-12: 12px; --spacing-16: 16px;
  --spacing-20: 20px; --spacing-24: 24px; --spacing-28: 28px; --spacing-32: 32px;
  --spacing-40: 40px; --spacing-64: 64px; --spacing-80: 80px; --spacing-96: 96px;
  --spacing-124: 124px; --spacing-128: 128px; --spacing-160: 160px;

  /* Layout */
  --page-max-width: 1200px;
  --section-gap: 80px;
  --card-padding: 20px;
  --element-gap: 8px;

  /* Radii */
  --radius-cards: 24px;
  --radius-images: 12px;
  --radius-inputs: 16px;
  --radius-buttons: 9999px;
  --radius-smallcards: 16px;
  --radius-elevatedcards: 20px;

  /* Shadows */
  --shadow-subtle: oklab(0 0 0 / 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 4px 24px 0px;
  --shadow-subtle-2: oklab(0 0 0 / 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 8px 40px 0px;
  --shadow-floating-artifact: rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px;

  /* Surfaces */
  --surface-canvas: #ffffff;
  --surface-card-mist: #f2f2f3;
  --surface-section-fog: #fafafb;
  --surface-accent-blush: #fbe1d1;
  --surface-elevated-white: #ffffff;
}
```

**Core components to implement as reusable primitives** (see Section 9.1–9.2 for usage rules):
- Pill Button — Filled (`bg-ink-black`, `text-paper-white`, `rounded-full`)
- Pill Button — Ghost (`bg-transparent`, `border-ink-black`, `text-ink-black`, `rounded-full`)
- Text Link with Arrow (no border/background, arrow glyph in the label string, underline only on `:hover`)
- Nav Link (transparent, 16px Söhne 400)
- Neutral Card (`bg-mist-gray`, `rounded-3xl`, no shadow)
- Accent Peach Card (`bg-blush-peach`, `text-sienna-brown`, `rounded-3xl`, no shadow, max one per page)
- Floating Product Artifact (`bg-paper-white`, `rounded-2xl`, `shadow-floating-artifact`, `padding: 16px 20px 12px 12px`)
- Input/Composer (`bg-paper-white`, hairline border `#ececec`, `rounded-2xl`, 16px padding)
- Stat Card with Chart (metric + delta + gestural line/radial chart, no axes/gridlines)
- Avatar Bubble (40px circle, tinted background, 2-letter monogram)
- Tag/Category Label (no background/border, 14px Söhne 400, Ash Gray)

---

## 10. Explicitly out of scope for this PRD (stub only)

- llms.txt generation endpoint/UI
- Automated AEO content rewriting tool
- Multi-LLM-engine monitoring (ChatGPT/Claude/Perplexity in addition to Kimi)
- Agency white-labeling / client-facing branded portals
- Payment/billing (assume FireGEO's Autumn/Stripe pattern if billing is needed, but not required for V1 functional build)
