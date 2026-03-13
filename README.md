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

The current theme uses a light-blue primary color system.
