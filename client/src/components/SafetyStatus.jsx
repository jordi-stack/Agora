import React, { useState } from 'react'
import { useT } from '../App.jsx'

const dots = { green: '🟢', yellow: '🟡', red: '🔴' }
const info = { minBalance: 'Never spend below this USDT0 threshold.', spendingRate: 'Max USDT0 per hour.', emergencyDrop: 'Pause if balance drops this % in 1 hour.' }

export default function SafetyStatus({ safety }) {
  const { t } = useT()
  const [show, setShow] = useState(false)
  if (!safety) return null
  const c = { green: t.accent, yellow: t.yellow, red: t.red }
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: t.sub, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Safety Status {dots[safety.overall] || '⚪'}</h3>
        <button onClick={() => setShow(!show)} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 4, color: t.muted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, padding: '2px 8px' }}>{show ? 'Hide' : '?'}</button>
      </div>
      {show && <div style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 4, padding: 10, marginBottom: 12, fontSize: 11, color: t.sub, lineHeight: 1.5 }}>Hard-coded safety rules the agent cannot override.</div>}
      {safety.paused && <div style={{ background: t.redBg, color: t.red, padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 12 }}>AGENT PAUSED</div>}
      {safety.rules?.map((r, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: t.sub }}>{r.label}</span>
            <span style={{ fontSize: 12, color: c[r.status], fontWeight: 'bold' }}>{dots[r.status]} {r.value} / {r.threshold}</span>
          </div>
          {show && info[r.name] && <div style={{ fontSize: 10, color: t.dim, marginTop: 2 }}>{info[r.name]}</div>}
        </div>
      ))}
    </div>
  )
}
