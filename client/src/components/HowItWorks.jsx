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
            <p style={{ color: t.sub, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Agora is an autonomous AI agent that earns, decides, and manages capital independently.</p>
            {[
              ['1. EARN', 'Sells market analysis and risk scoring via x402 micropayments. Every request pays USDT0 automatically on Sepolia.'],
              ['2. DECIDE', 'Every 5 minutes, the LLM analyzes revenue and decides: adjust prices, transfer profits, or hold steady.'],
              ['3. MANAGE', 'Three wallets: Treasury, Savings, Demo Buyer. Safety rules (min balance, max tx, rate limit, emergency pause) protect funds. Click "?" on Safety Status for details.'],
              ['4. TRY IT', 'Click "Buy Market Analysis" or "Buy Risk Score" below to trigger a real x402 payment and watch the agent react.'],
            ].map(([title, desc]) => (
              <div key={title} style={step}>
                <div style={{ color: t.accent, fontWeight: 'bold', fontSize: 14 }}>{title}</div>
                <div style={{ color: t.sub, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: 12, background: t.accentBg, borderRadius: 6, fontSize: 12, color: t.muted }}>Built with Tether WDK + x402 protocol + LLaMA on Sepolia testnet.</div>
          </div>
        </div>
      )}
    </>
  )
}
