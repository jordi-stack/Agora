import React from 'react'

const card = { background: '#111118', borderRadius: 8, padding: 20, border: '1px solid #222', maxHeight: 350, overflowY: 'auto' }

const actionColors = {
  hold: '#888', transfer: '#00ff88', reprice: '#00ccff', paused: '#ff4444', error: '#ff4444',
}
const actionIcons = {
  hold: '⏸', transfer: '💰', reprice: '📊', paused: '⚠️', error: '❌',
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

export default function ReasoningTrail({ decisions }) {
  return (
    <div style={card}>
      <h3 style={{ color: '#888', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Agent Reasoning Trail
      </h3>
      {decisions.length === 0 ? (
        <div style={{ color: '#444', fontSize: 12, textAlign: 'center', padding: 20 }}>
          Waiting for first agent cycle (30s after start)...
        </div>
      ) : (
        decisions.slice(0, 20).map((d, i) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: actionColors[d.action] || '#888', fontSize: 13, fontWeight: 'bold' }}>
                {actionIcons[d.action] || '•'} {d.action?.toUpperCase()}
                <span style={{ color: '#555', fontWeight: 'normal', marginLeft: 6, fontSize: 11 }}>
                  confidence: {(d.confidence || 0).toFixed(2)}
                </span>
              </span>
              <span style={{ color: '#444', fontSize: 11 }}>
                #{d.cycle} · {timeAgo(d.timestamp)}
              </span>
            </div>
            <div style={{ color: '#777', fontSize: 11, lineHeight: 1.4 }}>
              {d.reasoning?.substring(0, 200)}{d.reasoning?.length > 200 ? '...' : ''}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
