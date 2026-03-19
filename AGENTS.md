# Agora - Agent Guidelines

## Project Overview

Agora is an autonomous AI agent that operates as an independent economic actor on the Plasma blockchain. It sells AI-powered analysis services via x402 micropayments and manages its own treasury via Tether WDK.

## Architecture

- `src/agent/` - Agent brain (LLM reasoning, autonomous loop, treasury management)
- `src/wallet/` - WDK wallet layer (3 BIP-44 accounts, USDT0 transfers)
- `src/x402/` - Revenue engine (x402 payment middleware, dynamic pricing, services)
- `src/state/` - State persistence (Redis + in-memory fallback)
- `src/api/` - Dashboard API routes
- `src/config/` - Chain config, safety rules
- `client/` - React dashboard (Vite)

## Conventions

- ESM modules (`type: "module"` in package.json)
- No TypeScript - plain JavaScript for hackathon speed
- Seed phrases and keys via environment variables only
- All WDK packages under `@tetherto` scope
- USDT0 amounts in 6-decimal base units (1 USDT0 = 1000000)
- XPL (Plasma native) in 18-decimal wei

## Key Patterns

- Multi-provider LLM: auto-detects GROQ_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY
- TX Pipeline: estimate gas -> validate safety -> send -> confirm -> retry (3x)
- Agent Loop: runs every 5 min via setInterval, decisions logged with reasoning
- x402: Express middleware, Semantic facilitator handles settlement

## Testing

- Start server: `npm start`
- Test health: `curl http://localhost:3000/api/health`
- Test demo buyer: `curl -X POST http://localhost:3000/api/demo-buy -H 'Content-Type: application/json' -d '{"endpoint":"analyze"}'`
- Fund demo buyer: `node fund-demo.js`

## Safety Rules (hardcoded, agent cannot override)

- Min operating balance: 0.5 USDT0
- Max single transaction: 0.1 USDT0
- Spending rate limit: 0.2 USDT0/hour
- Emergency pause: balance drops >50% in 1 hour
