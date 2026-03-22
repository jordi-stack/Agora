import React, { useState } from 'react'
import { useT } from '../App.jsx'

const icons = { hold: '⏸', transfer: '💰', reprice: '📊', paused: '⚠️', error: '❌' }
const ago = ts => { const d = Date.now() - ts; return d < 60000 ? `${Math.floor(d/1000)}s ago` : d < 3600000 ? `${Math.floor(d/60000)}m ago` : `${Math.floor(d/3600000)}h ago` }

function ReasoningHelp({ t }) {
  const [open, setOpen] = useState(false)
  const item = { marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${t.accentBg}` }
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.muted, cursor: 'pointer', fontSize: 10, borderRadius: 4, padding: '2px 6px', marginLeft: 8 }}>?</button>
      {open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setOpen(false)}>
          <div style={{ background: t.card, borderRadius: 12, padding: 32, maxWidth: 540, width: '100%', border: `1px solid ${t.accent}44`, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: t.accent, fontSize: 18 }}>Agent Decision Types</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: 18 }}>X</button>
            </div>
            <div style={item}>
              <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><span style={{ fontSize: 14 }}>⏸</span> <b>HOLD</b> - Agent evaluated the current state and decided no action is needed. Treasury is stable, pricing is appropriate, no surplus to transfer.</div>
            </div>
            <div style={item}>
              <div style={{ fontSize: 12, color: t.accent, lineHeight: 1.5 }}><span style={{ fontSize: 14 }}>💰</span> <b>TRANSFER</b> - Agent detected surplus in Treasury (above 1.0 USDT0 threshold) and transferred profits to Savings. Amount is suggested by LLM but capped at 0.1 USDT0 per transaction.</div>
            </div>
            <div style={item}>
              <div style={{ fontSize: 12, color: t.blue, lineHeight: 1.5 }}><span style={{ fontSize: 14 }}>📊</span> <b>REPRICE</b> - Agent adjusted service prices based on demand patterns. High request volume increases prices (up to 3x), low volume decreases them (down to 0.5x).</div>
            </div>
            <div style={item}>
              <div style={{ fontSize: 12, color: t.red, lineHeight: 1.5 }}><span style={{ fontSize: 14 }}>⚠️</span> <b>PAUSED</b> - Safety rules violated. Agent halts all operations until conditions return to safe levels. Triggers: balance below 0.5 USDT0, spending over 0.2/hour, or balance dropped over 50% in one hour.</div>
            </div>
            <div style={item}>
              <div style={{ fontSize: 12, color: t.red, lineHeight: 1.5 }}><span style={{ fontSize: 14 }}>❌</span> <b>ERROR</b> - Agent cycle encountered an error (network issue, LLM timeout, etc). Agent will retry on next cycle automatically.</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: t.accent, marginBottom: 10, marginTop: 16 }}>Reading Each Entry</div>
            <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.8 }}>
              <b style={{ color: t.sub }}>Confidence</b> - LLM's certainty (0 to 1). Actions only execute at 0.7 or higher.<br/>
              <b style={{ color: t.sub }}>LLM Tools</b> - Reasoning tools the LLM chose to call (check_balances, check_revenue, check_pricing, etc).<br/>
              <b style={{ color: t.sub }}>WDK Tools</b> - MCP wallet operations triggered (getBalance, getTokenBalance, etc).<br/>
              <b style={{ color: t.sub }}>Signed</b> - Proof-of-life: agent signs a message each cycle using WDK sign() to prove it is active.
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function ReasoningTrail({ decisions }) {
  const { t } = useT()
  const ac = { hold: t.sub, transfer: t.accent, reprice: t.blue, paused: t.red, error: t.red }
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}`, maxHeight: 350, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ color: t.sub, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Agent Reasoning Trail</h3>
        <ReasoningHelp t={t} />
      </div>
      <div style={{ color: t.dim, fontSize: 10, marginBottom: 10 }}>Autonomous decisions made by the LLM every 5 minutes</div>
      {decisions.length === 0 ? <div style={{ color: t.dim, fontSize: 12, textAlign: 'center', padding: 20 }}>Waiting for first agent cycle (30s after start)...</div> :
        decisions.slice(0, 20).map((d, i) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: ac[d.action] || t.sub, fontSize: 13, fontWeight: 'bold' }}>
                {icons[d.action] || '•'} {d.action?.toUpperCase()}
                <span style={{ color: t.dim, fontWeight: 'normal', marginLeft: 6, fontSize: 11 }}>confidence: {(d.confidence || 0).toFixed(2)}</span>
              </span>
              <span style={{ color: t.dim, fontSize: 11 }}>#{d.cycle} · {ago(d.timestamp)}</span>
            </div>
            <div style={{ color: t.sub, fontSize: 11, lineHeight: 1.4 }}>{d.reasoning?.substring(0, 200)}{d.reasoning?.length > 200 ? '...' : ''}</div>
            {d.reasoningTools?.length > 0 && <div style={{ fontSize: 10, color: t.dim, marginTop: 4 }}>LLM Tools: {[...new Set(d.reasoningTools)].join(', ')}</div>}
            {d.mcpTools?.length > 0 && <div style={{ fontSize: 10, color: t.dim, marginTop: 2 }}>WDK Tools: {[...new Set(d.mcpTools)].join(', ')}</div>}
            {d.proofOfLife && <div style={{ fontSize: 10, color: t.dim, marginTop: 2 }}>Signed: {d.proofOfLife.signature}</div>}
          </div>
        ))}
    </div>
  )
}
