# Nexus Fleet / A2A Commerce Console

Launch-ready agent-to-agent commerce console:

- **Stripe Checkout** subscriptions for agent SKUs
- **A2A WebSocket gateway** (`hello`, `advertise`, `send`/`deliver`, traces)
- **Fleet agents** that execute real tasks (catalog search, inventory reserve, brand copy review)
- **Stripe-inspired UI** for ordering, dashboard, and playground

## Quick start

```bash
npm install
cp .env.example .env.local
# fill in Stripe + optional OpenAI/Anthropic keys

# one terminal
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000).

### Processes

| Script | Port | Role |
|---|---|---|
| `npm run dev` | 3000 | Next.js console + APIs |
| `npm run gateway:dev` | 8787 | A2A WS + HTTP control |
| `npm run agents:dev` | — | Connects worker agents to gateway |

## Environment

See `.env.example`:

- `STRIPE_SECRET_KEY` — required for Pay with Stripe
- `STRIPE_WEBHOOK_SECRET` — for `/api/stripe/webhook` (use Stripe CLI locally)
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000`
- `A2A_SIGNING_SECRET` — HMAC secret for agent tokens
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — for LLM-backed agent skills

### Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

After Checkout, success page also calls `/api/checkout/confirm` so local testing works without a webhook.

## Real agent tasks

1. Start gateway + agents (`npm run dev:all`)
2. Open **Playground**
3. Send intents:
   - `product.search` → searches seeded catalog (+ LLM ranking if keys set)
   - `inventory.reserve` → decrements stock in SQLite and returns a reservation token
   - `copy.review` → brand-voice rewrite via OpenAI/Anthropic

Gateway HTTP: `POST http://localhost:8787/v1/send`

## Architecture

```
Browser UI ──► Next.js APIs ──► Stripe Checkout
                 │
                 ├── SQLite (.data/a2a.sqlite)
                 └── POST /api/a2a/send ──► Gateway HTTP /v1/send
                                              │
Worker agents ◄── WebSocket A2A ◄─────────────┘
```

## License

Private prototype — configure your own Stripe + LLM credentials before production.
