import React from 'react'
import { useT } from '../App.jsx'

export default function PnLCard({ pnl }) {
  const { t } = useT()
  if (!pnl) return null
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
      <h3 style={{ color: t.sub, fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Profit & Loss</h3>
      <div style={{ color: t.dim, fontSize: 10, marginBottom: 10 }}>Revenue from x402 payments minus operational costs</div>
      <div style={{ fontSize: 32, fontWeight: 'bold', color: pnl.profit >= 0 ? t.accent : t.red, marginBottom: 8 }}>
        {pnl.profit >= 0 ? '+' : ''}{pnl.profit.toFixed(6)} USDT0
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div><span style={{ color: t.muted, fontSize: 11 }}>Revenue</span><div style={{ color: t.accent, fontSize: 16 }}>+{pnl.revenue.toFixed(6)}</div></div>
        <div><span style={{ color: t.muted, fontSize: 11 }}>Expenses</span><div style={{ color: t.orange, fontSize: 16 }}>-{pnl.expenses.toFixed(6)}</div></div>
      </div>
    </div>
  )
}
