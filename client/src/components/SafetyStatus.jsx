import React from 'react'

const card = { background: '#111118', borderRadius: 8, padding: 20, border: '1px solid #222' }
const colors = { green: '#00ff88', yellow: '#ffaa00', red: '#ff4444' }
const dots = { green: '🟢', yellow: '🟡', red: '🔴' }

export default function SafetyStatus({ safety }) {
  if (!safety) return null

  return (
    <div style={card}>
      <h3 style={{ color: '#888', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Safety Status {dots[safety.overall] || '⚪'}
      </h3>
      {safety.paused && (
        <div style={{ background: '#ff444422', color: '#ff4444', padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 12 }}>
          AGENT PAUSED — Safety rules violated
        </div>
      )}
      {safety.rules?.map((rule, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#aaa' }}>{rule.label}</span>
          <span style={{ fontSize: 12, color: colors[rule.status], fontWeight: 'bold' }}>
            {dots[rule.status]} {rule.value} / {rule.threshold}
          </span>
        </div>
      ))}
    </div>
  )
}
