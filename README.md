# fedey-frontend

Frontend dashboard for strategy-first AI social growth engine.

## Core UX Areas

- Strategy console (hypotheses and weekly plans)
- Experiment lab (variant tests and winners)
- Calendar and publishing visibility
- Content workspace (cross-platform transformations)
- Community inbox (reply queues + escalation)
- Analytics + recommendations

## Product Principle

The UI prioritizes learning velocity over content generation volume.

## Local Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `FEDEY_API_URL` to your backend URL.
The Experiment Lab form posts to backend `POST /v1/experiments`.
The analytics form posts engagement values to `POST /v1/analytics/events`.
The Brand Memory panel reads and updates `GET/PUT /v1/brand-memory`.
The Trend Radar panel reads and writes `GET/POST /v1/trends`.
The Content Engine reads `GET /v1/content/drafts` and triggers `POST /v1/content/drafts/generate`.
Draft variants are created through `POST /v1/content/drafts/{id}/variants/generate`.

The current theme uses a light-blue primary color system.
