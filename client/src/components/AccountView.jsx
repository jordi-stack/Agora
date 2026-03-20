import React from 'react'
import { useT } from '../App.jsx'

const roles = {
  treasury: 'Receives x402 revenue, pays expenses',
  savings: 'Stores autonomous profit transfers',
  demoBuyer: 'Pre-funded wallet for testing x402 payments',
}

export default function AccountView({ treasury, savings, demoBuyer }) {
  const { t } = useT()
  if (!treasury) return null
  const Acc = ({ name, role, data, color }) => !data ? null : (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ color: color || t.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{name}</div>
        <div style={{ fontSize: 10, color: t.dim }}>{role}</div>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginTop: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 'bold', color: t.accent }}>{data.usdt0?.toFixed(4) || '0.0000'} USDT0</span>
        <span style={{ fontSize: 13, color: t.muted }}>{data.native?.toFixed(4)} XPL</span>
      </div>
      <a href={`https://plasmascan.to/address/${data.address}`} target="_blank" rel="noopener" style={{ fontSize: 10, color: t.dim, wordBreak: 'break-all', textDecoration: 'none' }}>{data.address}</a>
    </div>
  )
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
      <h3 style={{ color: t.sub, fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Accounts (Plasma)</h3>
      <div style={{ color: t.dim, fontSize: 10, marginBottom: 12 }}>3 BIP-44 accounts from one seed phrase via WDK</div>
      <Acc name="Treasury (Acc 0)" role={roles.treasury} data={treasury} color={t.accent} />
      <Acc name="Savings (Acc 1)" role={roles.savings} data={savings} color={t.blue} />
      <Acc name="Demo Buyer (Acc 2)" role={roles.demoBuyer} data={demoBuyer} color={t.orange} />
    </div>
  )
}
