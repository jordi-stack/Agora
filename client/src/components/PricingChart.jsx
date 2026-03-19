import React from 'react'

const card = { background: '#111118', borderRadius: 8, padding: 20, border: '1px solid #222' }

export default function PricingChart({ pricing }) {
  if (!pricing) return null

  const renderEndpoint = (name, data) => {
    const pctChange = data.base > 0 ? ((data.current - data.base) / data.base * 100).toFixed(0) : 0
    const changeColor = pctChange > 0 ? '#00ff88' : pctChange < 0 ? '#ff6644' : '#888'

    return (
      <div key={name} style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#aaa', fontSize: 12 }}>/api/{name}</span>
          <span style={{ color: changeColor, fontSize: 11 }}>
            {pctChange > 0 ? '+' : ''}{pctChange}%
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 20, fontWeight: 'bold', color: '#00ccff' }}>
            ${data.humanPrice?.toFixed(4)}
          </span>
          <span style={{ fontSize: 11, color: '#555' }}>
            base: ${(data.base / 1e6).toFixed(4)} | {data.requests} req/hr
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={card}>
      <h3 style={{ color: '#888', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Dynamic Pricing
      </h3>
      {renderEndpoint('analyze', pricing.analyze)}
      {renderEndpoint('risk', pricing.risk)}
    </div>
  )
}
