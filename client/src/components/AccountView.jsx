import React from 'react'
import { useT } from '../App.jsx'

export default function AccountView({ treasury, savings }) {
  const { t } = useT()
  if (!treasury) return null
  const Acc = ({ name, data }) => !data ? null : (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: t.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{name}</div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginTop: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 'bold', color: t.accent }}>{data.usdt0?.toFixed(4) || '0.0000'} USDT0</span>
        <span style={{ fontSize: 13, color: t.muted }}>{data.native?.toFixed(4)} XPL</span>
      </div>
      <a href={`https://plasmascan.to/address/${data.address}`} target="_blank" rel="noopener" style={{ fontSize: 10, color: t.dim, wordBreak: 'break-all', textDecoration: 'none' }}>{data.address}</a>
    </div>
  )
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
      <h3 style={{ color: t.sub, fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Accounts (Plasma)</h3>
      <Acc name="Treasury (Acc 0)" data={treasury} />
      <Acc name="Savings (Acc 1)" data={savings} />
    </div>
  )
}
