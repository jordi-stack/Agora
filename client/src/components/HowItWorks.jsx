import React, { useState } from 'react'

const overlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.85)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20,
}
const modal = {
  background: '#111118', borderRadius: 12, padding: 32, maxWidth: 640,
  width: '100%', border: '1px solid #00ff8844', maxHeight: '80vh', overflowY: 'auto',
}
const step = { marginBottom: 16, paddingLeft: 16, borderLeft: '2px solid #00ff8833' }
const num = { color: '#00ff88', fontWeight: 'bold', fontSize: 14 }
const text = { color: '#aaa', fontSize: 13, marginTop: 4, lineHeight: 1.5 }

export default function HowItWorks() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '6px 14px', borderRadius: 6, border: '1px solid #00ff8844',
          background: 'transparent', color: '#00ff88', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 12, transition: 'all 0.2s',
        }}
      >
        ? How It Works
      </button>

      {open && (
        <div style={overlay} onClick={() => setOpen(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#00ff88', fontSize: 18 }}>How Agora Works</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>X</button>
            </div>

            <p style={{ color: '#888', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Agora is an autonomous AI agent that operates as an independent economic actor.
              It sells AI services, manages its own treasury, and makes financial decisions without human intervention.
            </p>

            <div style={step}>
              <div style={num}>1. EARN</div>
              <div style={text}>
                Agora sells AI-powered market analysis and wallet risk scoring via x402 micropayments.
                Every request automatically pays USDT0 on the Plasma blockchain. No API keys needed, just HTTP.
              </div>
            </div>

            <div style={step}>
              <div style={num}>2. DECIDE</div>
              <div style={text}>
                Every 5 minutes, the agent analyzes its revenue, evaluates market conditions, and uses LLM reasoning
                to decide: should it adjust prices, transfer profits to savings, or hold steady?
                All decisions are logged with full reasoning.
              </div>
            </div>

            <div style={step}>
              <div style={num}>3. MANAGE</div>
              <div style={text}>
                The agent manages 3 wallets: Treasury (operating funds), Savings (secured profits),
                and Demo Buyer (for testing). Hard-coded safety rules protect the treasury:
                minimum balance (0.5 USDT0), max transaction (0.1 USDT0), spending rate limit (0.2 USDT0/hr),
                and emergency pause if balance drops too fast. The agent cannot override these limits.
                Click the "?" button on the Safety Status card for details.
              </div>
            </div>

            <div style={step}>
              <div style={num}>4. TRY IT</div>
              <div style={text}>
                Click the green "Buy Market Analysis" or blue "Buy Risk Score" button below to trigger
                a real x402 payment. Watch the revenue appear instantly and the agent react in real-time.
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 12, background: '#00ff8808', borderRadius: 6, fontSize: 12, color: '#666' }}>
              Built with Tether WDK (self-custodial wallets), x402 protocol (HTTP micropayments),
              and LLaMA (open-source AI) on the Plasma blockchain.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
