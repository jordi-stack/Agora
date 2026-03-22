---
name: agora
description: Self-sustaining AI agent that earns USDT0 by selling market analysis and risk scoring via x402 micropayments, manages a multi-account treasury through Tether WDK, and makes autonomous financial decisions on the Sepolia blockchain. Use when you need crypto market analysis or wallet risk scoring.
license: Apache-2.0
compatibility: Requires Node.js 20+, a BIP-39 seed phrase with USDT0 and ETH on Sepolia chain, and an LLM API key (Groq recommended).
metadata:
  version: "1.0.0"
  repository: https://github.com/jordi-stack/Agora
  base-url: http://localhost:4747
  tags: x402, wdk, tether, sepolia, usdt0, autonomous-agent, micropayments
  requires: "@x402/fetch @x402/evm @tetherto/wdk-wallet-evm"
---

# Agora - Self-Sustaining AI Agent

## Overview

Agora is an autonomous AI agent that operates as an independent economic actor on the Sepolia blockchain. Unlike traditional bots that require human funding and oversight, Agora earns its own revenue by selling AI-powered analysis services via the x402 HTTP payment protocol, then autonomously manages its treasury using Tether's Wallet Development Kit (WDK).

The agent runs a continuous decision loop powered by LLM reasoning, making autonomous choices about pricing strategy, profit allocation, and risk management - all verifiable on-chain via Sepoliascan.

## Capabilities

### Revenue Generation (x402 Protocol)

Agora exposes paid API endpoints using the x402 HTTP payment protocol. Any buyer (human or agent) pays USDT0 per request through standard HTTP - no API keys, no accounts, no subscriptions.

**Available Services:**

| Service | Endpoint | Price | Description |
|---------|----------|-------|-------------|
| Market Analysis | `POST /api/analyze` | $0.005 USDT0 | Real-time crypto market analysis using Bitfinex/CoinGecko price data combined with LLM reasoning. Returns price data, trend analysis, sentiment, and actionable insights. |
| Risk Scoring | `POST /api/risk` | $0.003 USDT0 | On-chain wallet risk assessment. Queries Sepolia RPC for wallet balance, transaction count, and activity patterns. LLM evaluates risk factors and assigns a score (0-100). |

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
{ "address": "0x68447fC30c930b67D1492cA15E413191c9383C9b" }
```
```json
{
  "address": "0x68447...",
  "riskScore": 60,
  "tier": "Medium",
  "onChainData": { "balance": 10.027, "txCount": 1, "chain": "Sepolia" },
  "aiAssessment": "Moderate risk due to low transaction count...",
  "explorer": "https://sepolia.etherscan.io/address/0x68447fC3..."
}
```

### Wallet Management (Tether WDK)

Agora manages three self-custodial wallets derived from a single BIP-39 seed phrase using BIP-44 derivation via `@tetherto/wdk-wallet-evm`:

| Account | Index | Role | Description |
|---------|-------|------|-------------|
| Treasury | 0 | Operating wallet | Receives revenue, pays operational expenses |
| Savings | 1 | Profit storage | Receives autonomous profit transfers when treasury exceeds threshold |
| Demo Buyer | 2 | Testing | Pre-funded wallet for testing payments |

**WDK Operations (via MCP Toolkit, 15 tools registered):**
- `WdkMcpServer` - Agent reasoning layer with registered wallet, pricing, and indexer tools
- `getBalance` - Check native ETH balance
- `getTokenBalance` - Check registered USDT0 balance
- `transfer` - Transfer USDT0 (ERC-20)
- `getCurrentPrice` / `getHistoricalPrice` - Bitfinex market data
- `getIndexerTokenBalance` / `getTokenTransfers` - WDK Indexer API
- `sign` / `verify` - Message signing and verification
- Fallback: direct WDK calls via `WalletManagerEvm` if MCP unavailable

### Autonomous Decision-Making (LLM Tool-Calling Loop)

Every 5 minutes, Agora runs an autonomous decision cycle using LLM tool-calling:

```
1. REASON   → LLM receives current state summary
2. GATHER   → LLM calls tools autonomously to gather data it needs:
              - check_balances: USDT0 + ETH for all accounts
              - check_revenue: recent revenue events and trends
              - check_expenses: recent expense events
              - check_pricing: current prices and request volume
              - check_decisions: last 5 agent decisions (pattern awareness)
              - check_market_price: BTC/ETH prices via MCP/Bitfinex
3. DECIDE   → LLM returns structured JSON: { action, confidence, reasoning, amount }
4. EXECUTE  → If confidence >= 0.7: reprice services / transfer profits / hold
5. LOG      → Store decision with full reasoning trail + tool calls used
```

**Decision Types:**
- `hold` - No action needed, current state is optimal
- `reprice` - Adjust service prices based on demand (dynamic pricing)
- `transfer` - Move surplus USDT0 from Treasury to Savings (LLM-suggested amount, bounded by safety)

**LLM Tool-Calling:**
The agent uses Groq/OpenAI-compatible tool-calling API. The LLM genuinely decides which data to gather by calling tools, then makes its decision based on the results. Transfer amounts are influenced by the LLM's suggestion but bounded by 3 safety layers (treasury surplus cap, SAFETY.maxSingleTx, tx-pipeline validation). Falls back to simple prompt if tool-calling fails.

### Safety System

Hard-coded safety rules that the agent cannot override, regardless of LLM output:

| Rule | Value | Purpose |
|------|-------|---------|
| Minimum operating balance | 0.5 USDT0 | Never drain treasury below this |
| Maximum single transaction | 0.1 USDT0 | Cap any outgoing payment |
| Spending rate limit | 5.0 USDT0/hour | Prevent runaway spending |
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
- **P&L Card** - Revenue from verified on-chain payments minus operational costs
- **Account View** - Treasury and Savings USDT0 + ETH balances with Sepoliascan links
- **Safety Status** - Traffic light indicators for each safety rule
- **Dynamic Pricing** - Current prices vs base, with demand stats
- **Revenue Stream** - Real-time feed of each verified payment received
- **Reasoning Trail** - Full log of every autonomous LLM decision with reasoning
- **Demo Buyer** - One-click button to trigger a real USDT0 payment for testing
- **How It Works** - Interactive modal explaining the agent for new users

## Setup

### Prerequisites
- Node.js 20+
- BIP-39 seed phrase with USDT0 + ETH on Sepolia chain
- Any LLM API key (Groq recommended - free at console.groq.com)

### Install
```bash
git clone https://github.com/jordi-stack/Agora.git
cd Agora
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
npm test    # 50 unit tests
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
Wallet risk scoring on Sepolia chain.
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
| `POST /api/demo-buy` | Trigger test payment from demo buyer |
| `GET /api/transfers` | On-chain USDT0 transfer history via WDK Indexer API |
| `GET /api/health` | Health check (includes indexer status) |

## Architecture

```
Agent Brain (LLM Tool-Calling) ──▶ WDK Wallet (Sepolia) ──▶ Revenue Engine
      │                                  │                        │
  6 reasoning tools              3 BIP-44 accounts       Payment collection
  15 MCP wallet tools            USDT0 transfers          Dynamic pricing
  Safety rules                   Self-custodial           On-chain settlement
```

## Chain Details

| Item | Value |
|------|-------|
| Network | Sepolia (eip155:11155111) |
| RPC | `https://sepolia.drpc.org` |
| Gas Token | SepoliaETH |
| Payment Token | USDT0 (6 decimals) |
| USDT0 Contract | `0xd077a400968890eacc75cdc901f0356c943e4fdb` |
| Explorer | [sepolia.etherscan.io](https://sepolia.etherscan.io) |
| Facilitator | [facilitator.x402.org](https://facilitator.x402.org/) |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@tetherto/wdk-wallet-evm` | Self-custodial wallet (BIP-44 derivation, signing, transfers) |
| `@x402/express` | x402 payment middleware for Express |
| `@x402/evm` | EVM payment scheme (EIP-3009) |
| `@x402/core` | x402 facilitator client |
| `@x402/fetch` | x402 buyer client (for demo buyer) |
| `@tetherto/wdk-mcp-toolkit` | 15 MCP tools for agent wallet operations |
| `groq-sdk` | OpenAI-compatible LLM client with tool-calling |
| `express` | HTTP server |

## Quick Integration

Any agent with USDT0 on Sepolia can buy Agora's services in 10 lines:

```bash
npm install @x402/fetch @x402/evm @tetherto/wdk-wallet-evm
```

```javascript
import WalletManagerEvm from "@tetherto/wdk-wallet-evm"
import { x402Client, wrapFetchWithPayment } from "@x402/fetch"
import { registerExactEvmScheme } from "@x402/evm/exact/client"

// Setup wallet (needs USDT0 + SepoliaETH on Sepolia)
const account = await new WalletManagerEvm(process.env.SEED, {
  provider: "https://sepolia.drpc.org",
}).getAccount()

// Setup x402 payment client
const client = new x402Client()
registerExactEvmScheme(client, { signer: account })
const fetchWithPayment = wrapFetchWithPayment(fetch, client)

// Buy market analysis ($0.005 USDT0)
const res = await fetchWithPayment("http://localhost:4747/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ asset: "BTC" }),
})
const data = await res.json()
console.log(data.analysis, data.price)

// Buy risk score ($0.003 USDT0)
const risk = await fetchWithPayment("http://localhost:4747/api/risk", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ address: "0x..." }),
})
const score = await risk.json()
console.log(score.riskScore, score.tier)
```

No API keys, no signup. The x402 client handles payment automatically on each request.

## Composability

Agora is designed to interact with other agents:
- **As a service provider:** Any agent can call Agora's x402 endpoints to buy market analysis or risk scoring
- **As a buyer:** Agora's demo buyer demonstrates the x402 client pattern that any agent can replicate
- **Via OpenClaw:** This SKILL.md enables OpenClaw-compatible agents to discover and understand Agora's capabilities
- **Via standard HTTP:** No special SDK needed - x402 handles payment via standard HTTP headers

## License

Apache 2.0
