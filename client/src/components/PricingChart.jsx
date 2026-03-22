import React from 'react'
import { useT } from '../App.jsx'
import InfoModal from './InfoModal.jsx'

export default function PricingChart({ pricing }) {
  const { t } = useT()
  if (!pricing) return null
  const E = (name, d) => {
    const p = d.base > 0 ? ((d.current - d.base) / d.base * 100).toFixed(0) : 0
    return (
      <div key={name} style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: t.sub, fontSize: 12 }}>/api/{name}</span>
          <span style={{ color: p > 0 ? t.accent : p < 0 ? t.orange : t.sub, fontSize: 11 }}>{p > 0 ? '+' : ''}{p}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 20, fontWeight: 'bold', color: t.blue }}>${d.humanPrice?.toFixed(4)}</span>
          <span style={{ fontSize: 11, color: t.dim }}>base: ${(d.base / 1e6).toFixed(4)} | {d.requests} req/hr</span>
        </div>
      </div>
    )
  }
  const item = { marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${t.accentBg}` }
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: t.sub, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Dynamic Pricing</h3>
        <InfoModal title="Dynamic Pricing">
          <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginBottom: 14 }}>The agent autonomously adjusts service prices based on request demand. Pricing is controlled by the LLM through the reprice action.</div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b style={{ color: t.blue }}>Current Price</b> - The active price per request in USDT0. This is what buyers pay when calling the endpoint.</div>
          </div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b>Base Price</b> - The default price before any adjustments. /api/analyze: $0.005, /api/risk: $0.003.</div>
          </div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b style={{ color: t.accent }}>% Change</b> - How much the current price differs from base. Green = price increased (high demand), orange = price decreased (low demand).</div>
          </div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b>req/hr</b> - Number of requests received in the current hour. The LLM uses this to evaluate demand via check_pricing.</div>
          </div>
          <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginTop: 12 }}>
            <b style={{ color: t.sub }}>Price Range</b> - 0.5x to 3.0x of base price. Anti-thrashing logic prevents erratic changes between cycles. The LLM triggers reprice when demand shifts more than 20%.
          </div>
        </InfoModal>
      </div>
      {E('analyze', pricing.analyze)}{E('risk', pricing.risk)}
    </div>
  )
}
