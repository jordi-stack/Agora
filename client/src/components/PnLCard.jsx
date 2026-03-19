import React from 'react'

const card = { background: '#111118', borderRadius: 8, padding: 20, border: '1px solid #222' }

export default function PnLCard({ pnl }) {
  if (!pnl) return null
  const profitColor = pnl.profit >= 0 ? '#00ff88' : '#ff4444'

  return (
    <div style={card}>
      <h3 style={{ color: '#888', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
        Profit & Loss
      </h3>
      <div style={{ color: '#444', fontSize: 10, marginBottom: 10 }}>Revenue from x402 payments minus operational costs</div>
      <div style={{ fontSize: 32, fontWeight: 'bold', color: profitColor, marginBottom: 8 }}>
        {pnl.profit >= 0 ? '+' : ''}{pnl.profit.toFixed(6)} USDT0
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <span style={{ color: '#666', fontSize: 11 }}>Revenue</span>
          <div style={{ color: '#00ff88', fontSize: 16 }}>+{pnl.revenue.toFixed(6)}</div>
        </div>
        <div>
          <span style={{ color: '#666', fontSize: 11 }}>Expenses</span>
          <div style={{ color: '#ff6644', fontSize: 16 }}>-{pnl.expenses.toFixed(6)}</div>
        </div>
      </div>
    </div>
  )
}
