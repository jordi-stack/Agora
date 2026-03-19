import React from 'react'
import { useT } from '../App.jsx'

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
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
      <h3 style={{ color: t.sub, fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Dynamic Pricing</h3>
      {E('analyze', pricing.analyze)}{E('risk', pricing.risk)}
    </div>
  )
}
