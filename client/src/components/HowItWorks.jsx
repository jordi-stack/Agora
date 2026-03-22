import React, { useState } from 'react'
import { useT } from '../App.jsx'

export default function HowItWorks() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const step = { marginBottom: 16, paddingLeft: 16, borderLeft: `2px solid ${t.accentBg}` }
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${t.accentBg}`, background: 'transparent', color: t.accent, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>? How It Works</button>
      {open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setOpen(false)}>
          <div style={{ background: t.card, borderRadius: 12, padding: 32, maxWidth: 640, width: '100%', border: `1px solid ${t.accent}44`, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: t.accent, fontSize: 18 }}>How Agora Works</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: 18 }}>X</button>
            </div>
            <p style={{ color: t.sub, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Agora is a self-sustaining AI agent that sells services, earns USDT0, and manages its own treasury autonomously on Sepolia.</p>
            {[
              ['1. EARN', 'Two paid API services: Market Analysis ($0.005 USDT0) uses Bitfinex/CoinGecko price data with LLM reasoning. Risk Scoring ($0.003 USDT0) queries Sepolia RPC for on-chain wallet data with LLM assessment. Buyers pay per request via x402 payment architecture with on-chain WDK settlement.'],
              ['2. DECIDE', 'Every 5 minutes, the LLM uses tool-calling to autonomously gather data. It calls 6 reasoning tools: check_balances, check_revenue, check_expenses, check_pricing, check_decisions, and check_market_price. Then it decides: hold, transfer profits to savings, or adjust pricing. Decisions execute only when confidence is 0.7 or higher.'],
              ['3. DYNAMIC PRICING', 'The agent autonomously adjusts service prices based on demand. High request volume increases prices (up to 3x base), low volume decreases them (down to 0.5x base). The LLM evaluates demand patterns via check_pricing and can trigger a reprice action. Anti-thrashing logic prevents erratic price changes between cycles. Current prices are visible in the Dynamic Pricing card above.'],
              ['4. MANAGE', 'Three self-custodial BIP-44 wallets from one seed phrase via WDK: Treasury (Account 0) receives revenue and pays expenses. Savings (Account 1) stores profits when treasury exceeds 1.0 USDT0. Demo Buyer (Account 2) is pre-funded for testing payments. Transfer amounts are suggested by the LLM but bounded by safety rules.'],
              ['5. PROTECT', 'Four hard-coded safety rules the LLM cannot override: minimum operating balance (0.5 USDT0), maximum single transaction (0.1 USDT0), spending rate limit (0.2 USDT0/hour), and emergency pause if balance drops more than 50% in one hour. The agent pauses automatically when any rule is violated.'],
              ['6. PERSIST', 'Agent state (revenue, expenses, decisions, transactions) persists to disk and survives restarts. The Reasoning Trail below shows every autonomous decision the agent has ever made, including which LLM tools and WDK tools were called each cycle.'],
              ['7. TRY IT', 'Click "Buy Market Analysis" or "Buy Risk Score" below. A real USDT0 transfer executes on Sepolia from the Demo Buyer wallet to Treasury. You will see the transaction hash and can verify it on Sepolia Etherscan. Revenue and P&L update after the confirmed on-chain transfer.'],
            ].map(([title, desc]) => (
              <div key={title} style={step}>
                <div style={{ color: t.accent, fontWeight: 'bold', fontSize: 14 }}>{title}</div>
                <div style={{ color: t.sub, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: 12, background: t.accentBg, borderRadius: 6, fontSize: 12, color: t.muted, lineHeight: 1.5 }}>Built with Tether WDK (wdk-wallet-evm + wdk-mcp-toolkit, 15 tools) + x402 protocol + Groq LLaMA (tool-calling) on Sepolia testnet. 50 unit tests. Apache 2.0.</div>
          </div>
        </div>
      )}
    </>
  )
}
