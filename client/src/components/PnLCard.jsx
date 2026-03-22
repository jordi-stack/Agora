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
        <h3 style={{ color: t.sub, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Agent Performance</h3>
        <InfoModal title="Agent Performance">
          <div style={item}>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b style={{ color: t.accent }}>Revenue</b> - Total USDT0 received from verified on-chain payments. Only counts real transfers (wdk-settlement), not API requests without payment.</div>
          </div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}><b style={{ color: t.blue }}>Saved</b> - Total USDT0 the agent has autonomously transferred from Treasury to Savings. This is profit allocation, not an expense. The money is still owned by the agent in the Savings wallet.</div>
          </div>
          <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginTop: 12 }}>All data persists to disk and survives server restarts. All amounts in USDT0 (6 decimals).</div>
        </InfoModal>
      </div>
      <div style={{ color: t.dim, fontSize: 10, marginBottom: 10 }}>Revenue earned and profits saved by the agent</div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div><span style={{ color: t.muted, fontSize: 11 }}>Revenue</span><div style={{ color: t.accent, fontSize: 22, fontWeight: 'bold' }}>+{pnl.revenue.toFixed(6)}</div></div>
        <div><span style={{ color: t.muted, fontSize: 11 }}>Saved</span><div style={{ color: t.blue, fontSize: 22, fontWeight: 'bold' }}>{pnl.expenses.toFixed(6)}</div></div>
      </div>
    </div>
  )
}
