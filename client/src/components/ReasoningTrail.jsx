import React from 'react'
import { useT } from '../App.jsx'

const icons = { hold: '⏸', transfer: '💰', reprice: '📊', paused: '⚠️', error: '❌' }
const ago = ts => { const d = Date.now() - ts; return d < 60000 ? `${Math.floor(d/1000)}s ago` : d < 3600000 ? `${Math.floor(d/60000)}m ago` : `${Math.floor(d/3600000)}h ago` }

export default function ReasoningTrail({ decisions }) {
  const { t } = useT()
  const ac = { hold: t.sub, transfer: t.accent, reprice: t.blue, paused: t.red, error: t.red }
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}`, maxHeight: 350, overflowY: 'auto' }}>
      <h3 style={{ color: t.sub, fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Agent Reasoning Trail</h3>
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
