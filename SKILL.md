---
name: agora
display_name: Agora - Self-Sustaining AI Agent
description: Autonomous AI agent that earns USDT0 by selling intelligence services via x402 micropayments, manages its own treasury through Tether WDK, and makes independent financial decisions on the Plasma blockchain.
version: 1.0.0
author: jordi-stack
repository: https://github.com/jordi-stack/agora
license: Apache-2.0
tags:
  - x402
  - wdk
  - tether
  - plasma
  - usdt0
  - autonomous-agent
  - treasury-management
  - micropayments
  - defi
  - agentic-payments
requires:
  - "@tetherto/wdk-wallet-evm"
  - "@x402/express"
  - "@x402/evm"
  - "@x402/core"
  - "@x402/fetch"
  - "groq-sdk"
---

# Agora - Self-Sustaining AI Agent

## Overview

Agora is an autonomous AI agent that operates as an independent economic actor on the Plasma blockchain. Unlike traditional bots that require human funding and oversight, Agora earns its own revenue by selling AI-powered analysis services via the x402 HTTP payment protocol, then autonomously manages its treasury using Tether's Wallet Development Kit (WDK).

The agent runs a continuous decision loop powered by LLM reasoning, making autonomous choices about pricing strategy, profit allocation, and risk management - all verifiable on-chain via Plasmascan.

## Capabilities

### Revenue Generation (x402 Protocol)

Agora exposes paid API endpoints using the x402 HTTP payment protocol. Any buyer (human or agent) pays USDT0 per request through standard HTTP - no API keys, no accounts, no subscriptions.

**Available Services:**

| Service | Endpoint | Price | Description |
|---------|----------|-------|-------------|
| Market Analysis | `POST /api/analyze` | $0.005 USDT0 | Real-time crypto market analysis using Bitfinex/CoinGecko price data combined with LLM reasoning. Returns price data, trend analysis, sentiment, and actionable insights. |
| Risk Scoring | `POST /api/risk` | $0.003 USDT0 | On-chain wallet risk assessment. Queries Plasma RPC for wallet balance, transaction count, and activity patterns. LLM evaluates risk factors and assigns a score (0-100). |

**Request Examples:**

**Market Analysis:**
```
POST /api/analyze
{ "asset": "BTC" }
```
```json
{
  "asset": "BTC",
  "price": { "lastPrice": 70560, "high": 71200, "low": 69800, "changePercent": -0.046 },
  "analysis": "BTC showing short-term correction with support at $69.8k...",
  "confidence": 0.85,
  "poweredBy": "CoinGecko + groq"
}
```

**Risk Scoring:**
```
POST /api/risk
{ "address": "0x51329BA9cE9703A44CBFB437a668187b505fACa7" }
```
```json
{
  "address": "0x51329...",
  "riskScore": 60,
  "tier": "Medium",
  "onChainData": { "balance": 10.027, "txCount": 1, "chain": "Plasma" },
  "aiAssessment": "Moderate risk due to low transaction count...",
  "explorer": "https://plasmascan.to/address/0x51329..."
}
```

### Wallet Management (Tether WDK)

Agora manages three self-custodial wallets derived from a single BIP-39 seed phrase using BIP-44 derivation via `@tetherto/wdk-wallet-evm`:

| Account | Index | Role | Description |
|---------|-------|------|-------------|
| Treasury | 0 | Operating wallet | Receives x402 revenue, pays operational expenses |
| Savings | 1 | Profit storage | Receives autonomous profit transfers when treasury exceeds threshold |
| Demo Buyer | 2 | Testing | Pre-funded wallet for testing x402 payment flow |

**WDK Operations Used:**
- `WalletManagerEvm(seed, { provider })` - Initialize wallet from seed phrase
- `manager.getAccount(index)` - Derive BIP-44 account by index
- `account.getAddress()` - Get wallet address
- `account.getBalance()` - Check native XPL balance
- `account.transfer({ token, recipient, amount })` - Transfer USDT0 (ERC-20)
- WDK Indexer API (`wdk-api.tether.io`) - Primary USDT0 balance source (if API key set)
- Raw RPC `eth_call` with ERC-20 `balanceOf` - Fallback USDT0 balance check

### Autonomous Decision-Making (Agent Loop)

Every 5 minutes, Agora runs an autonomous decision cycle:

```
1. CHECK    → Read USDT0 + XPL balances via WDK
2. ANALYZE  → Compare revenue trends from state history
3. REASON   → Query LLM with full context (balances, revenue, pricing, safety rules)
4. DECIDE   → LLM returns structured JSON: { action, confidence, reasoning }
5. EXECUTE  → If confidence >= 0.7: reprice services / transfer profits / hold
6. LOG      → Store decision with full reasoning trail
```

**Decision Types:**
- `hold` - No action needed, current state is optimal
- `reprice` - Adjust service prices based on demand (dynamic pricing)
- `transfer` - Move surplus USDT0 from Treasury to Savings

**LLM Reasoning:**
The agent uses a structured system prompt that enforces JSON output and includes anti-thrashing logic (no price reversal within 2 cycles unless conditions shift >20%). Failed JSON parsing triggers a 3-step fallback: extract from code block → extract any JSON object → default to hold.

### Safety System

Hard-coded safety rules that the agent cannot override, regardless of LLM output:

| Rule | Value | Purpose |
|------|-------|---------|
| Minimum operating balance | 0.5 USDT0 | Never drain treasury below this |
| Maximum single transaction | 0.1 USDT0 | Cap any outgoing payment |
| Spending rate limit | 0.2 USDT0/hour | Prevent runaway spending |
| Emergency pause | Balance drops >50% in 1 hour | Halt all operations |

### Dynamic Pricing

The agent tracks request volume per hour and autonomously adjusts service prices:
- High demand → prices increase (up to 3x base)
- Low demand → prices decrease (down to 0.5x base)
- Anti-thrashing logic prevents erratic price changes
- Price changes are logged with LLM reasoning

### Multi-Provider LLM

Agora auto-detects the LLM provider from environment variables. Supports any OpenAI-compatible API:

| Provider | Environment Variable | Default Model |
|----------|---------------------|---------------|
| Groq | `GROQ_API_KEY` | llama-3.1-8b-instant |
| OpenAI | `OPENAI_API_KEY` | gpt-4o-mini |
| Together | `TOGETHER_API_KEY` | Llama-3.1-8B-Instruct-Turbo |
| Fireworks | `FIREWORKS_API_KEY` | llama-v3p1-8b-instruct |
| Anthropic | `ANTHROPIC_API_KEY` | claude-haiku-4-5 |
| Custom | `LLM_API_KEY` + `LLM_BASE_URL` | (user specified) |

## Dashboard

Real-time React dashboard showing:
- **P&L Card** - Revenue from x402 payments minus operational costs
- **Account View** - Treasury and Savings USDT0 + XPL balances with Plasmascan links
- **Safety Status** - Traffic light indicators for each safety rule
- **Dynamic Pricing** - Current prices vs base, with demand stats
- **Revenue Stream** - Real-time feed of each x402 micropayment received
- **Reasoning Trail** - Full log of every autonomous LLM decision with reasoning
- **Demo Buyer** - One-click button to trigger a real x402 payment for testing
- **How It Works** - Interactive modal explaining the agent for new users

## Setup

### Prerequisites
- Node.js 20+
- BIP-39 seed phrase with USDT0 + XPL on Plasma chain
- Any LLM API key (Groq recommended - free at console.groq.com)

### Install
```bash
git clone https://github.com/jordi-stack/agora.git
cd agora
npm install
cd client && npm install && npx vite build && cd ..
cp .env.example .env
```

### Configure
Edit `.env` with your seed phrase and LLM API key:
```env
WDK_SEED=your twelve word seed phrase here
GROQ_API_KEY=your_groq_key
```

### Run
```bash
npm start
```
Dashboard: `http://localhost:4747`

### Test
```bash
npm test    # 22 unit tests
```

### Fund Demo Buyer
```bash
node scripts/fund-demo.js    # Transfer 0.1 USDT0 to demo buyer account
```

## API Reference

### Paid Endpoints (x402 Payment Required)

#### POST /api/analyze
Market analysis for any crypto asset.
- **Input:** `{ "asset": "BTC" }` (supports BTC, ETH, SOL, etc.)
- **Output:** Price data, LLM analysis, confidence score
- **Price:** $0.005 USDT0 (dynamic, adjusts with demand)

#### POST /api/risk
Wallet risk scoring on Plasma chain.
- **Input:** `{ "address": "0x..." }`
- **Output:** Risk score (0-100), tier, on-chain data, AI assessment
- **Price:** $0.003 USDT0 (dynamic, adjusts with demand)

### Free Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/status` | Current agent state: balances, P&L, pricing, safety |
| `GET /api/history` | Revenue events, expenses, agent decisions |
| `GET /api/reasoning` | Agent decision trail with full LLM reasoning |
| `GET /api/pricing-history` | Dynamic pricing changes over time |
| `POST /api/demo-buy` | Trigger test x402 payment from demo buyer |
| `GET /api/transfers` | On-chain USDT0 transfer history via WDK Indexer API |
| `GET /api/health` | Health check (includes indexer status) |

## Architecture

```
Agent Brain (LLM) ──▶ WDK Wallet (Plasma) ──▶ x402 Revenue Engine
      │                      │                        │
  Reasoning loop       3 BIP-44 accounts       Micropayment collection
  Safety rules         USDT0 transfers          Dynamic pricing
  Decision logging     Self-custodial           On-chain settlement
```

## Chain Details

| Item | Value |
|------|-------|
| Network | Plasma (eip155:9745) |
| RPC | `https://rpc.plasma.to` |
| Gas Token | XPL (~$0.10, near-zero gas costs) |
| Payment Token | USDT0 (6 decimals) |
| USDT0 Contract | `0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb` |
| Explorer | [plasmascan.to](https://plasmascan.to) |
| Facilitator | [x402.semanticpay.io](https://x402.semanticpay.io) |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@tetherto/wdk-wallet-evm` | Self-custodial wallet (BIP-44 derivation, signing, transfers) |
| `@x402/express` | x402 payment middleware for Express |
| `@x402/evm` | EVM payment scheme (EIP-3009) |
| `@x402/core` | x402 facilitator client |
| `@x402/fetch` | x402 buyer client (for demo buyer) |
| `groq-sdk` | OpenAI-compatible LLM client |
| `express` | HTTP server |

## Composability

Agora is designed to interact with other agents:
- **As a service provider:** Any agent can call Agora's x402 endpoints to buy market analysis or risk scoring
- **As a buyer:** Agora's demo buyer demonstrates the x402 client pattern that any agent can replicate
- **Via OpenClaw:** This SKILL.md enables OpenClaw-compatible agents to discover and understand Agora's capabilities
- **Via standard HTTP:** No special SDK needed - just HTTP requests with x402 payment headers

## License

Apache 2.0
