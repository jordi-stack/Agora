import React, { useState, useEffect, createContext, useContext } from 'react'
import { getTheme } from './theme.js'
import PnLCard from './components/PnLCard.jsx'
import RevenueStream from './components/RevenueStream.jsx'
import ReasoningTrail from './components/ReasoningTrail.jsx'
import AccountView from './components/AccountView.jsx'
import SafetyStatus from './components/SafetyStatus.jsx'
import PricingChart from './components/PricingChart.jsx'
import DemoBuyer from './components/DemoBuyer.jsx'
import HowItWorks from './components/HowItWorks.jsx'

export const ThemeCtx = createContext()
export const useT = () => useContext(ThemeCtx)

export default function App() {
  const [status, setStatus] = useState(null)
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState(() => localStorage.getItem('agora-theme') || 'dark')

  const t = getTheme(mode)
  const toggle = () => { const n = mode === 'dark' ? 'light' : 'dark'; setMode(n); localStorage.setItem('agora-theme', n) }

  const fetchData = async () => {
    try {
      const [s, h] = await Promise.all([fetch('/api/status').then(r => r.json()), fetch('/api/history').then(r => r.json())])
      setStatus(s); setHistory(h); setError(null)
    } catch (err) { setError(err.message) }
  }

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 10_000); return () => clearInterval(i) }, [])
  useEffect(() => { document.body.style.background = t.bg; document.body.style.color = t.text }, [mode])

  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 16 }
  const badge = { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', marginLeft: 8 }

  if (!status) return (
    <ThemeCtx.Provider value={{ t, mode, toggle }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', background: t.bg }}>
        <img src="/logo.png" alt="Agora" style={{ width: 64, height: 64, marginBottom: 16 }} />
        <div style={{ color: t.accent, fontSize: 18, fontWeight: 'bold' }}>AGORA</div>
        <div style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>Self-Sustaining AI Agent</div>
        <div style={{ color: t.dim, fontSize: 12, marginTop: 16 }}>{error ? `Connection error: ${error}` : 'Connecting to Sepolia testnet...'}</div>
        {error && <button onClick={fetchData} style={{ marginTop: 12, padding: '6px 16px', background: t.accent, color: t.btnText, border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Retry</button>}
      </div>
    </ThemeCtx.Provider>
  )

  return (
    <ThemeCtx.Provider value={{ t, mode, toggle }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', background: t.bg, minHeight: '100vh', transition: 'background 0.3s' }}>
        <div style={{ borderBottom: `1px solid ${t.border}`, paddingBottom: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h1 style={{ fontSize: 22, color: t.accent, letterSpacing: 2 }}>
                Agora <span style={{ color: t.dim, fontSize: 14, fontWeight: 'normal', marginLeft: 12 }}>Self-Sustaining AI Agent</span>
              </h1>
              <div style={{ color: t.muted, fontSize: 11, marginTop: 4 }}>
                Earning USDT0 via x402 on Sepolia
                <span style={{ ...badge, background: t.accentBg, color: t.accent }}>{status.safety?.overall === 'green' ? 'ACTIVE' : status.safety?.overall === 'yellow' ? 'CAUTION' : 'PAUSED'}</span>
                <span style={{ ...badge, background: t.blueBg, color: t.blue }}>{status.llmProvider?.toUpperCase()}</span>
                <span style={{ ...badge, background: mode === 'dark' ? '#ffffff11' : '#00000011', color: t.muted }}>Sepolia</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <HowItWorks />
              <button onClick={toggle} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.card, color: t.sub, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                {mode === 'dark' ? '☀ Light' : '🌙 Dark'}
              </button>
              {error && <span style={{ color: t.red, fontSize: 11 }}>Error</span>}
            </div>
          </div>
        </div>
        <div style={grid}><PnLCard pnl={status.pnl} /><AccountView treasury={status.treasury} savings={status.savings} demoBuyer={status.demoBuyer} /></div>
        <div style={grid}><SafetyStatus safety={status.safety} /><PricingChart pricing={status.pricing} /></div>
        <div style={{ marginBottom: 16 }}><DemoBuyer onPayment={fetchData} /></div>
        <div style={grid}><RevenueStream revenue={history?.revenue || []} /><ReasoningTrail decisions={history?.decisions || []} /></div>
        <div style={{ textAlign: 'center', padding: '24px 0', color: t.dim, fontSize: 10 }}>Agora Agent - Hackathon Galactica: WDK Edition 1 - Tether WDK + x402 + {status.llmProvider}</div>
      </div>
    </ThemeCtx.Provider>
  )
}
