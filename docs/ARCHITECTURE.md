# Agora Architecture

## System Overview

```
                     ┌─────────────────┐
                     │    External      │
                     │  Buyers / Agents │
                     └────────┬────────┘
                              │
                              │ POST /api/analyze ($0.005)
                              │ POST /api/risk    ($0.003)
                              ▼
┌────────────────────────────────────────────────────────────┐
│                       EXPRESS SERVER                        │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ x402 Payment │  │   Service    │  │   Dashboard    │  │
│  │ Middleware   │─▶│   Handlers   │  │   API Routes   │  │
│  │              │  │              │  │                │  │
│  │ - Verify pay │  │ - Bitfinex   │  │ GET /status    │  │
│  │ - Settle     │  │ - CoinGecko  │  │ GET /history   │  │
│  │ - Log revenue│  │ - LLM        │  │ GET /transfers │  │
│  │              │  │              │  │ POST /demo-buy │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
│         │                                    │            │
│         ▼                                    ▼            │
│  ┌────────────────────────────────────────────────────┐   │
│  │       STATE STORE (JSON file, debounced 5s)        │   │
│  │  revenue[] · expenses[] · decisions[] · pricing    │   │
│  │  Persists to data/agora-state.json                 │   │
│  └────────────────────────────────────────────────────┘   │
│         │                                                 │
│         ▼                                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │          AUTONOMOUS AGENT LOOP (5 min)             │   │
│  │                                                    │   │
│  │  1. LLM receives state summary                    │   │
│  │  2. LLM calls tools (tool-calling API):            │   │
│  │     - check_balances  ──▶ MCP Toolkit ──▶ WDK     │   │
│  │     - check_revenue   ──▶ state store              │   │
│  │     - check_expenses  ──▶ state store              │   │
│  │     - check_pricing   ──▶ pricing engine            │   │
│  │     - check_decisions ──▶ decision history          │   │
│  │     - check_market_price ──▶ MCP/Bitfinex          │   │
│  │  3. LLM returns JSON decision                      │   │
│  │  4. execute()  ──▶ reprice / transfer / hold       │   │
│  │  5. logDecision() ──▶ state store + console        │   │
│  └────────────────────────────────────────────────────┘   │
│         │                                                 │
│         ▼                                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │               WDK WALLET LAYER                     │   │
│  │                                                    │   │
│  │  Account 0 (Treasury)  ◄── x402 revenue            │   │
│  │  Account 1 (Savings)   ◄── profit transfers        │   │
│  │  Account 2 (DemoBuyer) ──► test payments             │   │
│  │                                                    │   │
│  │  Chain: Sepolia (eip155:11155111)                   │   │
│  │  Token: USDT0                                      │   │
│  │  Self-custodial (BIP-44 from seed phrase)          │   │
│  └────────────────────────────────────────────────────┘   │
│         │                                                 │
│         ▼                                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │        WDK INDEXER API (wdk-api.tether.io)         │   │
│  │                                                    │   │
│  │  - Token balances (USDT0 per account)              │   │
│  │  - Transfer history (on-chain tx log)              │   │
│  │  - Fallback: raw RPC if API key not set            │   │
│  └────────────────────────────────────────────────────┘   │
│         │                                                 │
│         ▼                                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │                 SAFETY SYSTEM                      │   │
│  │                                                    │   │
│  │  - Min balance: 0.5 USDT0                         │   │
│  │  - Max single tx: 0.1 USDT0                       │   │
│  │  - Rate limit: 0.2 USDT0/hour                     │   │
│  │  - Emergency pause: >50% drop in 1 hour           │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                     REACT DASHBOARD                        │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   P&L    │  │ Accounts │  │  Safety  │  │ Pricing  │  │
│  │   Card   │  │   View   │  │  Status  │  │  Chart   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                    DEMO BUYER                        │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌────────────────────┐  ┌──────────────────────────────┐ │
│  │   Revenue Stream   │  │      Reasoning Trail         │ │
│  └────────────────────┘  └──────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Data Flow

### x402 Payment Flow

```
Buyer ──POST──▶ /api/analyze
                  │
          x402 middleware checks payment
                  │
          ┌───────▼────────┐
          │     x402        │
          │   Facilitator   │ ◄── verifies EIP-3009 signature
          │ (facilitator.x402.org)
          └───────┬────────┘
                  │ payment valid
                  ▼
          Service handler runs
          (Bitfinex + LLM)
                  │
          Facilitator settles on-chain
          (USDT0 transferred on Sepolia)
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
  │ via MCP Toolkit   │
  └────────┬─────────┘
           ▼
  ┌──────────────────┐
  │ LLM tool-calling: │
  │                   │
  │ - check_balances  │
  │ - check_revenue   │
  │ - check_expenses  │
  │ - check_pricing   │
  │ - check_decisions │
  │ - check_market    │
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
  │ validate ▶ convert│
  │ ▶ send via WDK    │
  │ ▶ retry (3x)      │
  └──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ (ESM) |
| Server | Express.js |
| Wallet | @tetherto/wdk-wallet-evm |
| Agent Framework | @tetherto/wdk-mcp-toolkit (15 tools) |
| Payments | @x402/express, @x402/evm, @x402/core |
| LLM | Groq / OpenAI / Together / Fireworks / Anthropic / custom |
| State | JSON file persistence (data/agora-state.json) |
| Indexer | WDK Indexer API (wdk-api.tether.io) |
| Frontend | React + Vite |
| Chain | Sepolia (eip155:11155111) |
| Token | USDT0 (6 decimals) |
| Gas | SepoliaETH |
