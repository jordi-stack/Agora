import React, { useState } from 'react'

const card = { background: '#111118', borderRadius: 8, padding: 20, border: '1px solid #222' }
const colors = { green: '#00ff88', yellow: '#ffaa00', red: '#ff4444' }
const dots = { green: '🟢', yellow: '🟡', red: '🔴' }

const ruleExplanations = {
  minBalance: 'Agent will not spend below this USDT0 threshold to ensure it always has operating funds.',
  spendingRate: 'Maximum USDT0 the agent can spend per hour. Prevents runaway spending.',
  emergencyDrop: 'If balance drops more than this percentage in 1 hour, the agent pauses all operations.',
}

export default function SafetyStatus({ safety }) {
  const [showInfo, setShowInfo] = useState(false)

  if (!safety) return null

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: '#888', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Safety Status {dots[safety.overall] || '⚪'}
        </h3>
        <button
          onClick={() => setShowInfo(!showInfo)}
          style={{
            background: 'none', border: '1px solid #333', borderRadius: 4,
            color: '#666', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 11, padding: '2px 8px',
          }}
        >
          {showInfo ? 'Hide' : '?'}
        </button>
      </div>

      {showInfo && (
        <div style={{ background: '#0a0a12', border: '1px solid #222', borderRadius: 4, padding: 10, marginBottom: 12, fontSize: 11, color: '#888', lineHeight: 1.5 }}>
          Hard-coded safety rules that the agent cannot override. These protect the treasury from overspending, rapid loss, or draining below minimum operating balance.
        </div>
      )}

      {safety.paused && (
        <div style={{ background: '#ff444422', color: '#ff4444', padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 12 }}>
          AGENT PAUSED - Safety rules violated
        </div>
      )}
      {safety.rules?.map((rule, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#aaa' }}>{rule.label}</span>
            <span style={{ fontSize: 12, color: colors[rule.status], fontWeight: 'bold' }}>
              {dots[rule.status]} {rule.value} / {rule.threshold}
            </span>
          </div>
          {showInfo && ruleExplanations[rule.name] && (
            <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
              {ruleExplanations[rule.name]}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
