import React from 'react'
import { useT } from '../App.jsx'
import InfoModal from './InfoModal.jsx'

const dots = { green: '🟢', yellow: '🟡', red: '🔴' }

export default function SafetyStatus({ safety }) {
  const { t } = useT()
  if (!safety) return null
  const c = { green: t.accent, yellow: t.yellow, red: t.red }
  const item = { marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${t.accentBg}` }
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h3 style={{ color: t.sub, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Safety Status {dots[safety.overall] || ''}</h3>
          <InfoModal title="Safety System">
            <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginBottom: 14 }}>Four hard-coded safety rules that the LLM cannot override. These are enforced in code before any transaction is signed. If any rule turns red, the agent pauses automatically.</div>
            <div style={item}>
              <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b>🟢 Minimum Balance (0.5 USDT0)</b> - Treasury must stay above this threshold. Prevents the agent from draining its operating funds.</div>
            </div>
            <div style={item}>
              <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b>🟢 Max Single Transaction (0.1 USDT0)</b> - Caps any outgoing transfer. Even if the LLM suggests a larger amount, it is clamped to this limit.</div>
            </div>
            <div style={item}>
              <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b>🟢 Spending Rate (0.2 USDT0/hour)</b> - Limits total outgoing transfers per hour. Turns yellow at 1.25x, red at 1.5x. Prevents runaway spending.</div>
            </div>
            <div style={item}>
              <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b>🟢 Balance Stability (50%)</b> - Emergency pause if treasury balance drops more than 50% within one hour. Protects against unexpected losses.</div>
            </div>
            <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginTop: 12 }}>
              <b style={{ color: t.sub }}>Reading the values</b> - Each rule shows current value / threshold. For example "0.35 / 0.2" means 0.35 USDT0 spent this hour against a 0.2 limit (exceeded, red).
            </div>
          </InfoModal>
        </div>
      </div>
      {safety.paused && <div style={{ background: t.redBg, color: t.red, padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 12 }}>AGENT PAUSED</div>}
      {safety.rules?.map((r, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: t.sub }}>{r.label}</span>
            <span style={{ fontSize: 12, color: c[r.status], fontWeight: 'bold' }}>{dots[r.status]} {r.value} / {r.threshold}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
