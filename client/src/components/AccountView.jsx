import React from 'react'

const card = { background: '#111118', borderRadius: 8, padding: 20, border: '1px solid #222' }
const acct = { marginBottom: 16 }
const label = { color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }
const addr = { fontSize: 10, color: '#555', wordBreak: 'break-all', textDecoration: 'none' }

function Account({ name, data }) {
  if (!data) return null
  return (
    <div style={acct}>
      <div style={label}>{name}</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginTop: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 'bold', color: '#00ff88' }}>
          {data.usdt0?.toFixed(4) || '0.0000'} USDT0
        </span>
        <span style={{ fontSize: 13, color: '#666' }}>
          {data.native?.toFixed(4)} XPL
        </span>
      </div>
      <a href={`https://plasmascan.to/address/${data.address}`} target="_blank" rel="noopener" style={addr}>
        {data.address}
      </a>
    </div>
  )
}

export default function AccountView({ treasury, savings }) {
  if (!treasury) return null

  return (
    <div style={card}>
      <h3 style={{ color: '#888', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Accounts (Plasma)
      </h3>
      <Account name="Treasury (Acc 0)" data={treasury} />
      <Account name="Savings (Acc 1)" data={savings} />
    </div>
  )
}
