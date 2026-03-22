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
            <p style={{ color: t.sub, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Agora is a self-sustaining AI agent that sells services, earns USDT0, and manages its own treasury autonomously on Sepolia. Here is what each section of the dashboard shows.</p>
            {[
              ['PROFIT & LOSS', 'Shows total revenue earned from verified on-chain payments minus operational expenses (profit transfers to savings). Only counts real USDT0 that moved on-chain, not API requests.'],
              ['ACCOUNTS', 'Three self-custodial BIP-44 wallets derived from one seed phrase via WDK. Treasury (Acc 0) receives revenue. Savings (Acc 1) stores profits when treasury exceeds 1.0 USDT0. Demo Buyer (Acc 2) is pre-funded for testing payments. Click any address to view on Sepolia Etherscan.'],
              ['SAFETY STATUS', 'Four hard-coded rules the LLM cannot override. Green = safe, Red = agent paused. Minimum balance: 0.5 USDT0. Max single transaction: 0.1 USDT0. Spending rate: 0.2 USDT0/hour. Emergency pause if balance drops more than 50% in one hour. Click "?" for details.'],
              ['DYNAMIC PRICING', 'Current service prices and request volume per endpoint. The LLM autonomously adjusts prices based on demand: high volume increases prices (up to 3x base), low volume decreases them (down to 0.5x). Anti-thrashing logic prevents erratic changes between cycles.'],
              ['DEMO BUYER', 'Click "Buy Market Analysis" ($0.005) or "Buy Risk Score" ($0.003) to trigger a real USDT0 transfer on Sepolia. Demo Buyer wallet pays Treasury wallet on-chain. The response includes a transaction hash you can verify on Sepolia Etherscan. This is how any agent or human would buy services from Agora.'],
              ['REVENUE STREAM', 'Real-time feed of every verified payment the agent received. Each entry shows the amount, endpoint, and type (wdk-settlement). Only appears after a successful on-chain transfer from Demo Buyer.'],
              ['REASONING TRAIL', 'Full log of every autonomous decision the agent makes every 5 minutes. The LLM uses tool-calling to gather data: "LLM Tools" shows which reasoning tools it called (check_balances, check_revenue, check_pricing, etc). "WDK Tools" shows the MCP wallet operations triggered (getBalance, getTokenBalance, etc). "Signed" is a proof-of-life cryptographic signature using WDK sign(). Decisions only execute when confidence is 0.7 or higher.'],
            ].map(([title, desc]) => (
              <div key={title} style={step}>
                <div style={{ color: t.accent, fontWeight: 'bold', fontSize: 13 }}>{title}</div>
                <div style={{ color: t.sub, fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: 12, background: t.accentBg, borderRadius: 6, fontSize: 11, color: t.muted, lineHeight: 1.5 }}>Built with Tether WDK (wdk-wallet-evm + wdk-mcp-toolkit, 15 tools) + x402 payment architecture + Groq LLaMA (tool-calling) on Sepolia testnet. State persists to disk across restarts. 50 unit tests. Apache 2.0.</div>
          </div>
        </div>
      )}
    </>
  )
}
