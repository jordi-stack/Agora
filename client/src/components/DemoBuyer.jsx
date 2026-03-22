import React, { useState } from 'react'
import { useT } from '../App.jsx'

export default function DemoBuyer({ onPayment }) {
  const { t } = useT()
  const [loading, setLoading] = useState(false)
  const [ep, setEp] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)

  const buy = async (endpoint) => {
    setLoading(true); setEp(endpoint); setError(null); setResult(null)
    try {
      const res = await fetch('/api/demo-buy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint }) })
      const data = await res.json()
      if (data.success) { setResult(data); setCount(c => c + 1); if (onPayment) setTimeout(onPayment, 1000) }
      else setError(data.error || 'Payment failed')
    } catch (err) { setError(err.message) }
    setLoading(false); setEp(null)
  }

  const btn = (color) => ({ padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 'bold', background: loading ? t.dim : color, color: t.btnText, opacity: loading && ep !== null ? 0.5 : 1, transition: 'all 0.2s' })

  return (
    <div style={{ background: t.card, borderRadius: 8, padding: 20, border: `1px solid ${t.accentBg}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ color: t.accent, fontSize: 14, marginBottom: 2 }}>Demo Buyer - Test Payments</h3>
          <span style={{ color: t.muted, fontSize: 11 }}>Trigger a real USD₮ payment on Sepolia. Agent earns USD₮ instantly.</span>
        </div>
        {count > 0 && <span style={{ color: t.accent, fontSize: 11, background: t.accentBg, padding: '2px 8px', borderRadius: 4 }}>{count} sent</span>}
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => buy('analyze')} disabled={loading} style={btn(t.accent)}>{loading && ep === 'analyze' ? 'Transferring USD₮...' : 'Buy Market Analysis ($0.005)'}</button>
        <button onClick={() => buy('risk')} disabled={loading} style={btn(t.blue)}>{loading && ep === 'risk' ? 'Transferring USD₮...' : 'Buy Risk Score ($0.003)'}</button>
      </div>
      {loading && <div style={{ color: t.accent, fontSize: 12, marginBottom: 8 }}>Processing payment on Sepolia...</div>}
      {error && <div style={{ background: t.redBg, color: t.red, padding: 10, borderRadius: 4, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      {result && (
        <div style={{ background: t.accentBg, border: `1px solid ${t.accent}33`, padding: 12, borderRadius: 4, fontSize: 12 }}>
          <div style={{ color: t.accent, marginBottom: 6, fontWeight: 'bold' }}>Payment Successful - Agent earned ${result.amount || (result.endpoint === 'analyze' ? '0.005' : '0.003')} USD₮</div>
          {result.txHash && <div style={{ fontSize: 11, color: t.sub, marginBottom: 6 }}>TX: <a href={result.explorer} target="_blank" rel="noopener" style={{ color: t.blue, textDecoration: 'none' }}>{result.txHash}</a></div>}
          <pre style={{ color: t.sub, fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', lineHeight: 1.4 }}>{JSON.stringify(result.response, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
