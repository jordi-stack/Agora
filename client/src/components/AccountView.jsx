import React from 'react'
import { useT } from '../App.jsx'
import InfoModal from './InfoModal.jsx'

const roles = {
  treasury: 'Receives revenue, pays expenses',
  savings: 'Stores autonomous profit transfers',
  demoBuyer: 'Pre-funded wallet for testing payments',
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
        <span style={{ fontSize: 20, fontWeight: 'bold', color: t.accent }}>{data.usdt0?.toFixed(4) || '0.0000'} USD₮</span>
        <span style={{ fontSize: 13, color: t.muted }}>{data.native?.toFixed(4)} ETH</span>
      </div>
      <a href={`https://sepolia.etherscan.io/address/${data.address}`} target="_blank" rel="noopener" style={{ fontSize: 10, color: t.dim, wordBreak: 'break-all', textDecoration: 'none' }}>{data.address}</a>
    </div>
  )
  const item = { marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${t.accentBg}` }
  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ color: t.sub, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Accounts (Sepolia)</h3>
        <InfoModal title="Accounts">
          <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginBottom: 14 }}>Three self-custodial BIP-44 wallets derived from a single seed phrase using @tetherto/wdk-wallet-evm. All wallets are non-custodial - only the seed phrase holder can access them.</div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.accent, lineHeight: 1.5 }}><b>Treasury (Account 0)</b> - Operating wallet. Receives USD₮ from service payments. Pays expenses (profit transfers to Savings). The agent's main financial account.</div>
          </div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.blue, lineHeight: 1.5 }}><b>Savings (Account 1)</b> - Profit storage. Receives autonomous transfers when Treasury balance exceeds 1.0 USD₮ threshold. The agent moves surplus here to protect profits. Owner can withdraw anytime via seed phrase.</div>
          </div>
          <div style={item}>
            <div style={{ fontSize: 12, color: t.orange, lineHeight: 1.5 }}><b>Demo Buyer (Account 2)</b> - Test wallet pre-funded with USD₮ and ETH for gas. Used by the Demo Buyer buttons to trigger real on-chain payments to Treasury. Simulates an external buyer purchasing services.</div>
          </div>
          <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, marginTop: 12 }}>
            <b style={{ color: t.sub }}>USD₮</b> - Payment token (ERC-20, 6 decimals) on Sepolia testnet.<br/>
            <b style={{ color: t.sub }}>ETH</b> - Gas token needed to execute on-chain transactions.<br/>
            <b style={{ color: t.sub }}>Address</b> - Click to view on Sepolia Etherscan.
          </div>
        </InfoModal>
      </div>
      <div style={{ color: t.dim, fontSize: 10, marginBottom: 12 }}>3 BIP-44 accounts from one seed phrase via WDK</div>
      <Acc name="Treasury (Acc 0)" role={roles.treasury} data={treasury} color={t.accent} />
      <Acc name="Savings (Acc 1)" role={roles.savings} data={savings} color={t.blue} />
      <Acc name="Demo Buyer (Acc 2)" role={roles.demoBuyer} data={demoBuyer} color={t.orange} />
    </div>
  )
}
