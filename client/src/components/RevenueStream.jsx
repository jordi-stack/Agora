import React from 'react'

const card = { background: '#111118', borderRadius: 8, padding: 20, border: '1px solid #222', maxHeight: 350, overflowY: 'auto' }

function timeAgo(ts) {
  const diff = Date.now() - ts
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

export default function RevenueStream({ revenue }) {
  return (
    <div style={card}>
      <h3 style={{ color: '#888', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
        Revenue Stream ({revenue.length})
      </h3>
      <div style={{ color: '#444', fontSize: 10, marginBottom: 10 }}>Each x402 micropayment received by the agent</div>
      {revenue.length === 0 ? (
        <div style={{ color: '#444', fontSize: 12, textAlign: 'center', padding: 20 }}>
          No payments yet — click Demo Buyer to start
        </div>
      ) : (
        revenue.slice(0, 30).map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
            <div>
              <span style={{ color: '#00ff88', fontSize: 13 }}>+${r.amount?.toFixed(4)}</span>
              <span style={{ color: '#555', fontSize: 11, marginLeft: 8 }}>/api/{r.endpoint}</span>
            </div>
            <span style={{ color: '#444', fontSize: 11 }}>{timeAgo(r.timestamp)}</span>
          </div>
        ))
      )}
    </div>
  )
}
