import React, { useState, useEffect } from 'react'
import PnLCard from './components/PnLCard.jsx'
import RevenueStream from './components/RevenueStream.jsx'
import ReasoningTrail from './components/ReasoningTrail.jsx'
import AccountView from './components/AccountView.jsx'
import SafetyStatus from './components/SafetyStatus.jsx'
import PricingChart from './components/PricingChart.jsx'
import DemoBuyer from './components/DemoBuyer.jsx'
import HowItWorks from './components/HowItWorks.jsx'

const header = {
  borderBottom: '1px solid #222', paddingBottom: 16, marginBottom: 24,
}
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 16 }
const badge = {
  display: 'inline-block', padding: '2px 8px', borderRadius: 4,
  fontSize: 10, fontWeight: 'bold', marginLeft: 8,
}

export default function App() {
  const [status, setStatus] = useState(null)
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const fetchData = async () => {
    try {
      const [s, h] = await Promise.all([
        fetch('/api/status').then(r => r.json()),
        fetch('/api/history').then(r => r.json()),
      ])
      setStatus(s)
      setHistory(h)
      setError(null)
      setLastFetch(Date.now())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10_000)
    return () => clearInterval(interval)
  }, [])

  if (!status) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <div style={{ color: '#00ff88', fontSize: 18, fontWeight: 'bold' }}>AGORA</div>
        <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Self-Sustaining AI Agent</div>
        <div style={{ color: '#444', fontSize: 12, marginTop: 16 }}>
          {error ? `Connection error: ${error}` : 'Connecting to Plasma blockchain...'}
        </div>
        {error && (
          <button onClick={fetchData} style={{ marginTop: 12, padding: '6px 16px', background: '#00ff88', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      <div style={header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, color: '#00ff88', letterSpacing: 2 }}>
              Agora
              <span style={{ color: '#444', fontSize: 14, fontWeight: 'normal', marginLeft: 12 }}>
                Self-Sustaining AI Agent
              </span>
            </h1>
            <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>
              Earning USDT0 via x402 on Plasma
              <span style={{ ...badge, background: '#00ff8822', color: '#00ff88' }}>
                {status.safety?.overall === 'green' ? 'ACTIVE' : status.safety?.overall === 'yellow' ? 'CAUTION' : 'PAUSED'}
              </span>
              <span style={{ ...badge, background: '#00ccff22', color: '#00ccff' }}>
                {status.llmProvider?.toUpperCase()}
              </span>
              <span style={{ ...badge, background: '#ffffff11', color: '#666' }}>
                Plasma (Chain 9745)
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <HowItWorks />
            {error && <span style={{ color: '#ff4444', fontSize: 11 }}>Connection error</span>}
          </div>
        </div>
      </div>

      <div style={grid2}>
        <PnLCard pnl={status.pnl} />
        <AccountView treasury={status.treasury} savings={status.savings} />
      </div>

      <div style={grid2}>
        <SafetyStatus safety={status.safety} />
        <PricingChart pricing={status.pricing} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <DemoBuyer onPayment={fetchData} />
      </div>

      <div style={grid2}>
        <RevenueStream revenue={history?.revenue || []} />
        <ReasoningTrail decisions={history?.decisions || []} />
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0', color: '#333', fontSize: 10 }}>
        Agora Agent — Hackathon Galactica: WDK Edition 1 — Powered by Tether WDK + x402 + {status.llmProvider}
      </div>
    </div>
  )
}
