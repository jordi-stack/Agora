import React from 'react'

const card = { background: '#111118', borderRadius: 8, padding: 20, border: '1px solid #222' }
const acct = { marginBottom: 12 }
const label = { color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }
const bal = { fontSize: 20, fontWeight: 'bold', color: '#e0e0e0' }
const addr = { fontSize: 10, color: '#555', wordBreak: 'break-all' }

export default function AccountView({ treasury, savings }) {
  if (!treasury) return null

  return (
    <div style={card}>
      <h3 style={{ color: '#888', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        Accounts
      </h3>
      <div style={acct}>
        <div style={label}>Treasury (Acc 0)</div>
        <div style={bal}>{treasury.native?.toFixed(4)} XPL</div>
        <a href={`https://plasmascan.to/address/${treasury.address}`} target="_blank" rel="noopener" style={addr}>
          {treasury.address}
        </a>
      </div>
      <div style={acct}>
        <div style={label}>Savings (Acc 1)</div>
        <div style={bal}>{savings.native?.toFixed(4)} XPL</div>
        <a href={`https://plasmascan.to/address/${savings.address}`} target="_blank" rel="noopener" style={addr}>
          {savings.address}
        </a>
      </div>
    </div>
  )
}
