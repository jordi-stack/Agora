# Agora Architecture

## System Overview

```
                    ┌─────────────────┐
                    │   External       │
                    │   Buyers/Agents  │
                    └────────┬────────┘
                             │ POST /api/analyze ($0.005)
                             │ POST /api/risk    ($0.003)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ x402 Payment │  │   Service    │  │  Dashboard    │ │
│  │ Middleware   │─▶│   Handlers   │  │  API Routes   │ │
│  │              │  │              │  │               │ │
│  │ - Verify pay │  │ - Bitfinex   │  │ GET /status    │ │
│  │ - Settle     │  │ - CoinGecko  │  │ GET /history   │ │
│  │ - Log revenue│  │ - LLM        │  │ GET /transfers │ │
│  │              │  │              │  │ POST /demo-buy │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
│         │                                    │           │
│         ▼                                    ▼           │
│  ┌─────────────────────────────────────────────────┐    │
│  │              STATE STORE (In-Memory)                 │    │
│  │  revenue[] · expenses[] · decisions[] · pricing  │    │
│  └─────────────────────────────────────────────────┘    │
│         │                                                │
│         ▼                                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │           AUTONOMOUS AGENT LOOP (5 min)          │    │
│  │                                                   │    │
│  │  1. getBalances() ──▶ WDK Wallet (Plasma RPC)    │    │
│  │  2. analyzeRevenue() ──▶ state history            │    │
│  │  3. getDecision() ──▶ LLM reasoning          │    │
│  │  4. execute() ──▶ reprice / transfer / hold       │    │
│  │  5. logDecision() ──▶ state store + console  │    │
│  └─────────────────────────────────────────────────┘    │
│         │                                                │
│         ▼                                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │              WDK WALLET LAYER                     │    │
│  │                                                   │    │
│  │  Account 0 (Treasury)  ◄── x402 revenue           │    │
│  │  Account 1 (Savings)   ◄── profit transfers       │    │
│  │  Account 2 (DemoBuyer) ──► test x402 payments     │    │
│  │                                                   │    │
│  │  Chain: Plasma (eip155:9745)                      │    │
│  │  Token: USDT0                                     │    │
│  │  Self-custodial (BIP-44 from seed phrase)         │    │
│  └─────────────────────────────────────────────────┘    │
│         │                                                │
│         ▼                                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │         WDK INDEXER API (wdk-api.tether.io)      │    │
│  │                                                   │    │
│  │  - Token balances (USDT0 per account)            │    │
│  │  - Transfer history (on-chain tx log)            │    │
│  │  - Fallback: raw RPC if API key not set          │    │
│  └─────────────────────────────────────────────────┘    │
│         │                                                │
│         ▼                                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │              SAFETY SYSTEM                        │    │
│  │                                                   │    │
│  │  - Min balance: 0.5 USDT0                        │    │
│  │  - Max single tx: 0.1 USDT0                      │    │
│  │  - Rate limit: 0.2 USDT0/hour                    │    │
│  │  - Emergency pause: >50% drop in 1 hour          │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  REACT DASHBOARD                         │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   P&L    │ │ Accounts │ │  Safety  │ │ Pricing  │  │
│  │   Card   │ │   View   │ │  Status  │ │  Chart   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌────────────────────────────────────────────────────┐ │
│  │              DEMO BUYER (x402 test)                 │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌──────────────────┐ ┌──────────────────────────────┐ │
│  │  Revenue Stream  │ │     Reasoning Trail          │ │
│  └──────────────────┘ └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### x402 Payment Flow
```
Buyer ──POST──▶ /api/analyze
                  │
          x402 middleware checks payment
                  │
          ┌───────▼────────┐
          │ Semantic        │
          │ Facilitator     │ ◄── verifies EIP-3009 signature
          │ (x402.semanticpay.io)
          └───────┬────────┘
                  │ payment valid
                  ▼
          Service handler runs
          (Bitfinex + LLM)
                  │
          Facilitator settles on-chain
          (USDT0 transferred on Plasma)
                  │
          Revenue logged to state store
                  │
          Response returned to buyer
```

### Autonomous Treasury Flow
```
Every 5 minutes:
  ┌──────────────────┐
  │ Check USDT0      │
  │ balances via WDK  │
  └────────┬─────────┘
           ▼
  ┌──────────────────┐
  │ LLM analyzes:     │
  │                    │
  │ - revenue trend   │
  │ - balance vs min  │
  │ - request volume  │
  └────────┬─────────┘
           ▼
  ┌──────────────────┐
  │ Decision:         │
  │ hold / transfer   │  confidence >= 0.7?
  │ / reprice         │──── no ──▶ log only
  └────────┬─────────┘
           │ yes
           ▼
  ┌──────────────────┐
  │ Execute via WDK   │
  │ TX Pipeline:      │
  │ gas ▶ validate    │
  │ ▶ send ▶ confirm  │
  │ ▶ retry (3x)      │
  └──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ (ESM) |
| Server | Express.js |
| Wallet | @tetherto/wdk-wallet-evm |
| Payments | @x402/express, @x402/evm, @x402/core |
| LLM | Groq / OpenAI / Together / Fireworks / Anthropic / custom |
| State | In-memory |
| Frontend | React + Vite |
| Chain | Plasma (eip155:9745) |
| Token | USDT0 (6 decimals) |
| Gas | XPL (near-zero cost) |
