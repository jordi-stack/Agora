import React from 'react'
import { useT } from '../App.jsx'

const ago = ts => { const d = Date.now() - ts; return d < 60000 ? `${Math.floor(d/1000)}s ago` : d < 3600000 ? `${Math.floor(d/60000)}m ago` : `${Math.floor(d/3600000)}h ago` }

export default function RevenueStream({ revenue }) {
  const { t } = useT()
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}`, maxHeight: 350, overflowY: 'auto' }}>
      <h3 style={{ color: t.sub, fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Revenue Stream ({revenue.length})</h3>
      <div style={{ color: t.dim, fontSize: 10, marginBottom: 10 }}>Each verified payment received by the agent</div>
      {revenue.length === 0 ? <div style={{ color: t.dim, fontSize: 12, textAlign: 'center', padding: 20 }}>No payments yet - click Demo Buyer to start</div> :
        revenue.slice(0, 30).map((r, i) => (
          <div key={i} style={{ padding: '6px 0', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><span style={{ color: t.accent, fontSize: 13 }}>+${r.amount?.toFixed(4)}</span><span style={{ color: t.dim, fontSize: 11, marginLeft: 8 }}>/api/{r.endpoint}</span></div>
              <span style={{ color: t.dim, fontSize: 11 }}>{ago(r.timestamp)}</span>
            </div>
            {r.txHash && <a href={`https://sepolia.etherscan.io/tx/${r.txHash}`} target="_blank" rel="noopener" style={{ fontSize: 10, color: t.dim, textDecoration: 'none' }}>TX: {r.txHash.slice(0, 16)}...</a>}
          </div>
        ))}
    </div>
  )
}
