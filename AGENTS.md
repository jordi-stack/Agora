# Agora - Agent Guidelines

## Project Overview

Agora is an autonomous AI agent that operates as an independent economic actor on the Sepolia testnet. It sells AI-powered analysis services via x402 micropayments and manages its own treasury via Tether WDK.

## Architecture

- `src/agent/` - Agent brain (LLM reasoning, autonomous loop, treasury management)
- `src/mcp/` - WDK MCP Toolkit integration (agent reasoning layer, 15 tools)
- `src/wallet/` - WDK wallet layer (3 BIP-44 accounts, USDT0 transfers, x402 backend)
- `src/x402/` - Revenue engine (x402 payment middleware, dynamic pricing, services)
- `src/state/` - JSON file persistence (data/agora-state.json) + WDK Indexer API client
- `src/api/` - Dashboard API routes
- `src/config/` - Chain config, safety rules
- `client/` - React dashboard (Vite)

## Conventions

- ESM modules (`type: "module"` in package.json)
- No TypeScript - plain JavaScript for hackathon speed
- Seed phrases and keys via environment variables only
- All WDK packages under `@tetherto` scope
- USDT0 amounts in 6-decimal base units (1 USDT0 = 1000000)
- SepoliaETH (native gas) in 18-decimal wei

## Key Patterns

- Multi-provider LLM: auto-detects GROQ_API_KEY / OPENAI_API_KEY / TOGETHER_API_KEY / FIREWORKS_API_KEY / ANTHROPIC_API_KEY. Supports tool-calling API.
- TX Pipeline: validate amount -> convert to base units -> send via WDK -> retry (3x)
- Agent Loop: runs every 5 min via setInterval. LLM uses tool-calling to gather data (6 reasoning tools: check_balances, check_revenue, check_expenses, check_pricing, check_decisions, check_market_price), then makes decisions. Proof-of-life signing each cycle.
- MCP Toolkit: 15 WDK tools registered (wallet, pricing, indexer). LLM reasoning tools call MCP tools internally.
- Dual WDK instances: MCP for agent reasoning, manager.js for x402 payment infrastructure
- x402: Express middleware with facilitator (facilitator.x402.org). On Sepolia, falls back to direct WDK transfer as settlement.

## Testing

- Start server: `npm start`
- Test health: `curl http://localhost:4747/api/health`
- Test demo buyer: `curl -X POST http://localhost:4747/api/demo-buy -H 'Content-Type: application/json' -d '{"endpoint":"analyze"}'`
- Fund demo buyer: `node scripts/fund-demo.js`

## Safety Rules (hardcoded, agent cannot override)

- Min operating balance: 0.5 USDT0
- Max single transaction: 0.1 USDT0
- Spending rate limit: 0.2 USDT0/hour
- Emergency pause: balance drops >50% in 1 hour
