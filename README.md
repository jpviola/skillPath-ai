# SkillPath AI

Personalized **language-learning** path generator for Spanish (default), English, French,
Italian, Ancient Greek and Latin. The AI produces a pedagogy-driven, week-by-week study plan —
comprehensible input, grammar-in-context, vocabulary with spaced repetition, and active
speaking/writing practice — and **adapts upcoming weeks based on your feedback**.

Built as a single deployable **Next.js (App Router)** app on Vercel — consolidating all 5 layers of
the original spec into one artifact.

## The 5 layers, mapped to this codebase

| Layer | Spec | Where |
|------|------|-------|
| **1 — Prompt engineering & LLM orchestration** | System prompt, strict JSON schema, feedback-loop logic | [src/lib/prompt.ts](src/lib/prompt.ts), [src/lib/schema.ts](src/lib/schema.ts), [src/lib/llm.ts](src/lib/llm.ts) |
| **2 — Frontend (React + Tailwind)** | Landing, onboarding wizard, dashboard (screenshot), week detail, progress/resources/settings | [src/app/](src/app/), [src/components/](src/components/) |
| **3 — Backend API** | `POST /api/v1/plan`, `POST /api/v1/plan/feedback` with validation, rate-limit, error handling | [src/app/api/v1/](src/app/api/v1/) |
| **4 — State management** | Context + `useReducer`, localStorage persistence, fetch client | [src/context/PlanContext.tsx](src/context/PlanContext.tsx), [src/lib/api.ts](src/lib/api.ts) |
| **5 — Infra & deployment** | Vercel-native, AI Gateway, env config, rate limiting, sanitization | `.env.example`, [src/lib/rateLimit.ts](src/lib/rateLimit.ts), this README |

### Notable design decisions vs. the original spec
- **One Next.js app instead of separate Vite SPA + Express server** — simpler to deploy and reason
  about; API routes are the backend. Fluid Compute runs full Node.js with a generous timeout.
- **LLM via Vercel AI Gateway** (`generateObject` + zod) instead of provider-specific SDKs — the zod
  schema guarantees valid structured output, no manual JSON parsing/retry. One env key for any model.
- **localStorage persistence for the MVP** instead of Postgres — zero infra to run it. The DB schema
  from the spec drops in later behind the same API contract (swap the route handlers' storage).
- **Distributed rate limiting via KV/Redis REST, with local fallback** — production deployments can
  share quotas across instances by setting `RATE_LIMIT_REDIS_REST_URL` and
  `RATE_LIMIT_REDIS_REST_TOKEN`; local dev keeps using in-memory counters.

## Run locally

```bash
cp .env.example .env.local
# add your AI_GATEWAY_API_KEY (https://vercel.com/ai-gateway)
npm install
npm run dev
# open http://localhost:3000
```

Without an `AI_GATEWAY_API_KEY` the UI still loads and you can explore the **sample plan**
(landing → "See a sample plan", or the link on the last onboarding step) — it loads a fully-formed
demo plan with zero API calls. Live generation requires the key.

### Streaming generation
Plan generation streams: `POST /api/v1/plan/stream` uses `streamObject`, and the onboarding wizard
([experimental_useObject](src/app/onboard/page.tsx)) renders each week as it arrives instead of
waiting for the full block. The non-streaming `POST /api/v1/plan` is kept for programmatic use.

## Deploy to Vercel

```bash
vercel            # link + preview
vercel env add AI_GATEWAY_API_KEY
vercel env add RATE_LIMIT_REDIS_REST_URL
vercel env add RATE_LIMIT_REDIS_REST_TOKEN
vercel --prod
```

## How the feedback loop works (the actual AI product)

1. Onboarding collects the profile → `POST /api/v1/plan` → strict JSON plan rendered on the dashboard.
2. On a week you submit **Too Easy / Just Right / Too Hard** + a comment.
3. `POST /api/v1/plan/feedback` rebuilds the system prompt with adaptation instructions
   ([buildPromptWithFeedback](src/lib/prompt.ts)) and regenerates the **remaining** weeks.
4. The dashboard merges the new weeks and shows the adaptation banner — no page reload.

## Tech
Next.js 16 · React 19 · Tailwind v4 · AI SDK v7 (AI Gateway) · zod · lucide-react.
