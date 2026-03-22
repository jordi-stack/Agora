import React from 'react'
import { useT } from '../App.jsx'
import InfoModal from './InfoModal.jsx'

export default function PnLCard({ pnl }) {
  const { t } = useT()
  if (!pnl) return null
  const item = { marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${t.accentBg}` }
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ color: t.sub, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Profit & Loss</h3>
        <InfoModal title="Profit & Loss">
          <div style={item}>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b style={{ color: t.accent }}>Revenue</b> - Total USDT0 received from verified on-chain payments. Only counts real transfers (wdk-settlement), not API requests without payment.</div>
          </div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b style={{ color: t.orange }}>Expenses</b> - Total USDT0 spent by the agent on autonomous profit transfers from Treasury to Savings. Each transfer is a real on-chain transaction.</div>
          </div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b>Profit</b> - Revenue minus Expenses. Green when positive, red when negative. A negative P&L means the agent has transferred more to Savings than it has earned from services.</div>
          </div>
          <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginTop: 12 }}>P&L data persists to disk and survives server restarts. All amounts in USDT0 (6 decimals).</div>
        </InfoModal>
      </div>
      <div style={{ color: t.dim, fontSize: 10, marginBottom: 10 }}>Revenue from verified payments minus operational costs</div>
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
