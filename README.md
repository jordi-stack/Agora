# Agora - Self-Sustaining AI Agent

An autonomous AI agent that earns USDT0 by selling intelligence services via x402 micropayments, manages its own multi-account treasury through Tether WDK, and makes financial decisions independently on the Plasma blockchain.

**Track:** Agent Wallets (WDK / Openclaw and Agents Integration)
**Hackathon:** [Tether Hackathon Galactica: WDK Edition 1](https://dorahacks.io/hackathon/hackathon-galactica-wdk-2026-01/detail)
**Live Demo:** [http://15.134.129.198:4747](http://15.134.129.198:4747)

---

## Overview

Agora operates as an **independent economic actor** with zero human intervention:

- **Earns** - Sells market analysis and wallet risk scoring via [x402](https://www.x402.org/) micropayments. Buyers pay USDT0 per request through standard HTTP.
- **Decides** - Runs an autonomous loop every 5 minutes. LLM reasoning evaluates revenue trends, adjusts pricing based on demand, and determines when to secure profits.
- **Manages** - Surplus revenue is transferred to a separate savings wallet via real on-chain transactions. All decisions are logged with full AI reasoning.

## On-Chain Proof

Verified transactions on Plasma:
- Demo buyer funding: [`0x1f08cc3d...`](https://plasmascan.to/tx/0x1f08cc3dc47c5a8f647c4ab9a47dc720b8c6a51f7c0a4b31bedb2c8773f2f9d9)
- Treasury address: [`0x51329BA9...`](https://plasmascan.to/address/0x51329BA9cE9703A44CBFB437a668187b505fACa7)

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      AGORA AGENT                          │
│                                                           │
│  ┌─────────────────┐      ┌────────────────────────────┐ │
│  │  AGENT BRAIN     │      │     WDK WALLET LAYER       │ │
│  │  (LLaMA / GPT /  │      │                            │ │
│  │   Claude - auto)  │─────▶│  Account 0: Treasury       │ │
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
│  Live P&L - Revenue Stream - Reasoning Trail             │
│  Dynamic Pricing - Safety Status - Demo Buyer Button     │
└──────────────────────────────────────────────────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed data flow diagrams.

## Key Features

### x402 Agentic Payments
The agent monetizes its services using the [x402 protocol](https://www.x402.org/). Buyers pay USDT0 per request. No API keys, no accounts, just HTTP.

- `POST /api/analyze` - Real-time market analysis (Bitfinex/CoinGecko + LLM reasoning)
- `POST /api/risk` - On-chain wallet risk scoring (Plasma RPC + LLM assessment)

### Dynamic Pricing
The agent autonomously adjusts prices based on demand. High request volume increases prices. Low demand returns to base. The agent decides its own pricing strategy through LLM reasoning.

### Multi-Account Treasury (WDK)
Three BIP-44 accounts derived from a single seed phrase using `@tetherto/wdk-wallet-evm`:

| Account | Index | Purpose |
|---------|-------|---------|
| Treasury | 0 | Receives x402 revenue, pays expenses |
| Savings | 1 | Receives autonomous profit transfers |
| Demo Buyer | 2 | Pre-funded for judges to test payments |

### Autonomous Agent Loop
Every 5 minutes, the agent independently:
1. Checks USDT0 and XPL balances via WDK
2. Analyzes revenue trends from state history
3. Queries the LLM for a decision (hold / transfer / reprice)
4. Executes the decision if confidence >= 0.7
5. Logs the full reasoning trail with timestamps

### Safety System
Hard-coded rules that the agent cannot override:
- Minimum operating balance: 0.5 USDT0
- Maximum single transaction: 0.1 USDT0
- Spending rate limit: 0.2 USDT0/hour
- Emergency pause if balance drops more than 50% in 1 hour

### Universal LLM Support
Auto-detects provider from environment variables. Supports any OpenAI-compatible API:
- `GROQ_API_KEY` - Groq with LLaMA (open-source, recommended)
- `OPENAI_API_KEY` - OpenAI with GPT
- `TOGETHER_API_KEY` - Together AI
- `FIREWORKS_API_KEY` - Fireworks AI
- `ANTHROPIC_API_KEY` - Anthropic with Claude
- `LLM_API_KEY` + `LLM_BASE_URL` - Any custom OpenAI-compatible provider

### Demo Buyer
A built-in test client that lets judges trigger real x402 payments with one click and observe the agent earning revenue in real-time through the dashboard.

### Interactive Help
A "How It Works" button in the dashboard header opens a step-by-step guide explaining how the agent earns, decides, manages, and how to test it. Each dashboard section includes descriptive subtitles for clarity.

### OpenClaw Integration
Agora includes a [SKILL.md](./SKILL.md) following the [AgentSkills specification](https://agentskills.io/specification), enabling discovery by any OpenClaw-compatible agent.

```bash
npx skills add jordi-stack/agora
```

Any agent can buy Agora's services via standard HTTP with x402 payment headers — no SDK needed. See [SKILL.md](./SKILL.md) for full capability listing, API reference, and integration details.

## Quick Start

### Prerequisites
- Node.js 20+
- A BIP-39 seed phrase with USDT0 + XPL on Plasma
- An LLM API key (Groq recommended, free at [console.groq.com](https://console.groq.com))

### Setup

```bash
git clone https://github.com/jordi-stack/agora.git
cd agora

# Install server dependencies
npm install

# Build dashboard
cd client && npm install && npx vite build && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your seed phrase and LLM API key
```

### Run

```bash
# Make sure you're in the project root: /agora (not /agora/client)
npm start
```

Open `http://localhost:4747` to see the dashboard.

### Production (pm2)

```bash
npm install -g pm2
pm2 start src/server.js --name agora
pm2 save
```

### Test

```bash
npm test
```

22 unit tests covering safety rules, dynamic pricing, treasury P&L calculation, and LLM JSON parsing.

### Fund Demo Buyer

Transfer a small amount of USDT0 to the demo buyer account:

```bash
node scripts/fund-demo.js
```

## API Endpoints

### Paid (x402)

| Method | Path | Price | Description |
|--------|------|-------|-------------|
| POST | `/api/analyze` | $0.005 USDT0 | Market analysis with real price data and LLM reasoning |
| POST | `/api/risk` | $0.003 USDT0 | Wallet risk scoring with on-chain data and LLM assessment |

### Free (Dashboard)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Current agent state, balances, pricing, safety |
| GET | `/api/history` | Revenue events, expenses, agent decisions |
| GET | `/api/reasoning` | Agent decision trail with LLM reasoning |
| GET | `/api/pricing-history` | Dynamic pricing changes over time |
| POST | `/api/demo-buy` | Trigger a test x402 payment from the demo buyer wallet |
| GET | `/api/health` | Health check |

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Wallet | [@tetherto/wdk-wallet-evm](https://docs.wallet.tether.io/) | Self-custodial, BIP-44, multi-account |
| Payments | [x402 Protocol](https://www.x402.org/) (@x402/express) | HTTP-native agentic micropayments |
| LLM | [Groq](https://groq.com/) / OpenAI / Anthropic / any | Universal provider, auto-detected |
| Chain | [Plasma](https://plasma.to/) (eip155:9745) | Tether's chain, near-zero gas |
| State | [Upstash Redis](https://upstash.com/) | Persistent state, free tier |
| Server | Express.js | x402 middleware compatible |
| Frontend | React + Vite | Lightweight, fast builds |
| Testing | Vitest | Fast unit testing |

## Chain Details

| Item | Value |
|------|-------|
| Chain | Plasma (eip155:9745) |
| RPC | `https://rpc.plasma.to` |
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
│   ├── x402/                  # Payment middleware, dynamic pricing, services
│   ├── agent/                 # LLM wrapper, reasoning engine, treasury, loop
│   ├── state/                 # Redis + in-memory store
│   └── api/                   # Dashboard API routes
├── client/                    # React dashboard (Vite)
├── test/                      # Unit tests (22 tests)
├── docs/                      # Architecture diagrams
├── scripts/                   # Utility scripts (fund-demo)
├── .env.example               # Environment template
├── AGENTS.md                  # AI agent guidelines
├── LICENSE                    # Apache 2.0
└── README.md
```

## Third-Party Services

| Service | Purpose |
|---------|---------|
| [Tether WDK](https://docs.wallet.tether.io/) | Self-custodial wallet infrastructure |
| [x402 Protocol](https://www.x402.org/) | HTTP payment protocol |
| [Semantic Facilitator](https://semanticpay.io/) | x402 payment verification and settlement |
| [Groq](https://groq.com/) | LLM inference (LLaMA, open-source) |
| [Upstash](https://upstash.com/) | Redis state persistence |
| [Bitfinex API](https://docs.bitfinex.com/) | Market price data (primary) |
| [CoinGecko API](https://www.coingecko.com/) | Market price data (fallback) |

## Known Limitations

- x402 payment settlement depends on the Semantic facilitator being available
- Dynamic pricing adjustments require the LLM to return valid JSON (fallback logic handles parse failures)
- Agent loop interval is fixed at 5 minutes (not configurable via environment)
- Dashboard uses polling (10s interval), not WebSocket

## License

Apache 2.0 - see [LICENSE](./LICENSE)
