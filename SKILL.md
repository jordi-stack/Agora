---
name: agora
display_name: Agora - Self-Sustaining AI Agent
description: Autonomous AI agent that sells intelligence services via x402 micropayments and manages its own USDT0 treasury on the Plasma blockchain using Tether WDK.
version: 1.0.0
author: jordi-stack
tags:
  - x402
  - wdk
  - tether
  - plasma
  - usdt0
  - autonomous-agent
  - treasury
  - micropayments
---

# Agora Agent Skill

Agora is an autonomous AI agent that operates as an independent economic actor on the Plasma blockchain. It earns USDT0 by selling AI analysis services via x402 micropayments, manages its own multi-account treasury through Tether WDK, and makes autonomous financial decisions.

## Capabilities

### Paid Services (x402)
- **Market Analysis** - Real-time crypto market analysis using Bitfinex/CoinGecko data and LLM reasoning. Costs $0.005 USDT0 per request.
- **Wallet Risk Scoring** - On-chain wallet risk assessment using Plasma RPC data and LLM evaluation. Costs $0.003 USDT0 per request.

### Treasury Management
- **Multi-Account Wallet** - 3 BIP-44 accounts (Treasury, Savings, Demo Buyer) derived from a single seed phrase via WDK.
- **Autonomous Loop** - Every 5 minutes the agent checks balances, analyzes revenue, adjusts pricing, and transfers profits.
- **Dynamic Pricing** - Agent autonomously adjusts service prices based on demand volume.
- **Safety Rules** - Hard-coded limits: min balance 0.5 USDT0, max tx 0.1 USDT0, spending rate 0.2 USDT0/hr.

## Setup

### Prerequisites
- Node.js 20+
- BIP-39 seed phrase with USDT0 + XPL on Plasma
- Any LLM API key (Groq, OpenAI, Anthropic, or compatible)

### Install
```bash
git clone https://github.com/jordi-stack/agora.git
cd agora
npm install
cd client && npm install && npx vite build && cd ..
cp .env.example .env
# Set WDK_SEED and at least one LLM API key
```

### Run
```bash
npm start
```

Dashboard available at `http://localhost:3000`

## API Reference

### Paid Endpoints (x402 payment required)

#### POST /api/analyze
Analyze crypto market conditions.
```json
{ "asset": "BTC" }
```
Returns: price data, LLM analysis, confidence score.

#### POST /api/risk
Score wallet risk on Plasma.
```json
{ "address": "0x..." }
```
Returns: risk score (0-100), tier, on-chain data, AI assessment.

### Free Endpoints

#### GET /api/status
Current agent state: balances, P&L, pricing, safety status.

#### GET /api/history
Revenue events, expenses, and agent decisions.

#### POST /api/demo-buy
Trigger a test x402 payment from the built-in demo buyer wallet.

## Architecture

```
Agent Brain (LLM reasoning) → WDK Wallet (Plasma USDT0) → x402 Revenue Engine
     ↓                              ↓                           ↓
 Autonomous decisions      3 BIP-44 accounts         Micropayment collection
     ↓                              ↓                           ↓
 Safety rules              Treasury management         Dynamic pricing
```

## Chain
- Network: Plasma (eip155:9745)
- Token: USDT0
- Gas: XPL (near-zero cost)
- Explorer: plasmascan.to

## License
Apache 2.0
