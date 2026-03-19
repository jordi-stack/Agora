# Agora — Self-Sustaining AI Agent

> An AI agent that earns its own living — selling intelligence via x402 micropayments, managing its treasury via WDK, and growing its capital autonomously on the Plasma blockchain.

**Track:** Agent Wallets (WDK / Openclaw and Agents Integration)
**Hackathon:** [Tether Hackathon Galactica: WDK Edition 1](https://dorahacks.io/hackathon/hackathon-galactica-wdk-2026-01/detail)

---

## What is Agora?

Agora is an autonomous AI agent that operates as an **independent economic actor**. It sells AI-powered analysis services via [x402](https://www.x402.org/) micropayments, manages its own multi-account treasury, and makes autonomous financial decisions — all without human intervention.

**The agent:**
- **Earns** — Sells market analysis and wallet risk scoring via x402 (HTTP 402 Payment Required). Every request pays USDT0 automatically.
- **Manages** — Runs an autonomous decision loop every 5 minutes. LLM reasoning analyzes revenue, adjusts pricing based on demand, and transfers profits to a savings account.
- **Grows** — Surplus revenue is autonomously moved to a separate savings wallet. All decisions are logged with full AI reasoning.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      AGORA AGENT                          │
│                                                           │
│  ┌─────────────────┐      ┌────────────────────────────┐ │
│  │  AGENT BRAIN     │      │     WDK WALLET LAYER       │ │
│  │  (LLaMA / GPT /  │      │                            │ │
│  │   Claude — auto)  │─────▶│  Account 0: Treasury       │ │
│  │                  │      │  Account 1: Savings        │ │
│  │  Autonomous Loop │      │  Account 2: Demo Buyer     │ │
│  │  (every 5 min)   │      │                            │ │
│  └─────────────────┘      │  Chain: Plasma (USDT0)     │ │
│                            └──────────┬─────────────────┘ │
│  SAFETY RULES:             ┌──────────▼─────────────────┐ │
│  - Min balance: 0.5 USDT0 │   x402 Revenue Engine      │ │
│  - Max tx: 0.1 USDT0      │   - Dynamic pricing        │ │
│  - Rate limit / emergency  │   - Auto-collect USDT0     │ │
│                            └────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  x402 PAID ENDPOINTS          │  FREE DASHBOARD APIS     │
│  POST /api/analyze ($0.005)   │  GET /api/status          │
│  POST /api/risk    ($0.003)   │  GET /api/history         │
│                               │  POST /api/demo-buy       │
├──────────────────────────────────────────────────────────┤
│                 REACT DASHBOARD                           │
│  Live P&L · Revenue Stream · Reasoning Trail             │
│  Dynamic Pricing · Safety Status · Demo Buyer Button     │
└──────────────────────────────────────────────────────────┘
```

## Key Features

### x402 Agentic Payments
The agent monetizes AI services using the [x402 protocol](https://www.x402.org/). Buyers pay USDT0 per request — no API keys, no accounts, just HTTP.

- `POST /api/analyze` — Real-time market analysis (Bitfinex data + LLM reasoning)
- `POST /api/risk` — On-chain wallet risk scoring (Plasma RPC + LLM assessment)

### Dynamic Pricing
The agent autonomously adjusts its prices based on demand. High request volume → prices increase. Low demand → prices return to base. No human sets prices.

### Multi-Account Treasury (WDK)
Three BIP-44 accounts derived from a single seed phrase:
| Account | Index | Purpose |
|---------|-------|---------|
| Treasury | 0 | Receives revenue, pays expenses |
| Savings | 1 | Receives autonomous profit transfers |
| Demo Buyer | 2 | Pre-funded for testing x402 payments |

### Autonomous Agent Loop
Every 5 minutes, the agent:
1. Checks balances via WDK
2. Analyzes revenue trends
3. Asks the LLM for a decision (hold / transfer / reprice)
4. Executes the decision if confidence ≥ 0.7
5. Logs full reasoning trail

### Safety System
Hard-coded rules the agent cannot override:
- Minimum operating balance: 0.5 USDT0
- Maximum single transaction: 0.1 USDT0
- Spending rate limit: 0.2 USDT0/hour
- Emergency pause if balance drops >50% in 1 hour

### Multi-Provider LLM
Auto-detects which LLM to use from environment variables:
- `GROQ_API_KEY` → Groq (LLaMA — open-source)
- `OPENAI_API_KEY` → OpenAI (GPT)
- `ANTHROPIC_API_KEY` → Anthropic (Claude)

### Demo Buyer
Judges can click a single button in the dashboard to trigger a real x402 payment and watch the agent earn revenue in real-time.

## Quick Start

### Prerequisites
- Node.js 20+
- A BIP-39 seed phrase with USDT0 + XPL on Plasma
- An LLM API key (Groq recommended — free tier)

### Setup

```bash
git clone https://github.com/jordi-stack/agora.git
cd agora
npm install
cd client && npm install && npx vite build && cd ..
```

### Configure

Create a `.env` file:

```env
# Required
WDK_SEED=your twelve word seed phrase here
GROQ_API_KEY=gsk_your_groq_api_key

# Optional (for persistence)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Optional (defaults shown)
PLASMA_RPC=https://rpc.plasma.to
PORT=3000
FACILITATOR_URL=https://x402.semanticpay.io/
LLM_MODEL=llama-3.1-8b-instant
```

### Run

```bash
npm start
```

Open `http://localhost:3000` to see the dashboard.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Wallet | [@tetherto/wdk-wallet-evm](https://docs.wallet.tether.io/) | Self-custodial, BIP-44, multi-account |
| Payments | [x402 Protocol](https://www.x402.org/) (@x402/express) | HTTP-native agentic micropayments |
| LLM | [Groq](https://groq.com/) (LLaMA 3.1) | Free, fast, open-source model |
| Chain | [Plasma](https://plasma.to/) (eip155:9745) | Tether's chain, near-zero gas |
| State | [Upstash Redis](https://upstash.com/) | Persistent, free tier |
| Server | Express.js | x402 middleware compatible |
| Dashboard | React + Vite | Lightweight, fast builds |

## Chain Details

| Item | Value |
|------|-------|
| Chain | Plasma (eip155:9745) |
| RPC | https://rpc.plasma.to |
| Gas Token | XPL (near-zero cost) |
| USDT0 Contract | `0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb` |
| Explorer | [plasmascan.to](https://plasmascan.to) |

## Project Structure

```
agora/
├── src/
│   ├── server.js              # Express entry point
│   ├── config/                # Chain config, safety rules
│   ├── wallet/                # WDK wallet manager, TX pipeline
│   ├── x402/                  # Payment middleware, pricing, services
│   ├── agent/                 # LLM wrapper, reasoning, treasury, loop
│   ├── state/                 # Redis/in-memory store
│   └── api/                   # Dashboard API routes
├── client/                    # React dashboard (Vite)
├── .env                       # Secrets (gitignored)
├── LICENSE                    # Apache 2.0
└── README.md
```

## Third-Party Services

| Service | Purpose |
|---------|---------|
| [Tether WDK](https://docs.wallet.tether.io/) | Wallet infrastructure |
| [x402 Protocol](https://www.x402.org/) | HTTP payment protocol |
| [Semantic Facilitator](https://semanticpay.io/) | x402 payment verification & settlement |
| [Groq](https://groq.com/) | LLM inference (LLaMA) |
| [Upstash](https://upstash.com/) | Redis state persistence |
| [Bitfinex API](https://docs.bitfinex.com/) | Market price data |

## License

Apache 2.0 — see [LICENSE](./LICENSE)
