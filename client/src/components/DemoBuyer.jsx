import React, { useState } from 'react'

const card = { background: '#0d1117', borderRadius: 8, padding: 20, border: '1px solid #00ff8844' }
const btn = {
  padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13, fontWeight: 'bold', transition: 'all 0.2s',
}

export default function DemoBuyer({ onPayment }) {
  const [loading, setLoading] = useState(false)
  const [activeEndpoint, setActiveEndpoint] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [paymentCount, setPaymentCount] = useState(0)

  const buy = async (endpoint) => {
    setLoading(true)
    setActiveEndpoint(endpoint)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/demo-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
        setPaymentCount(c => c + 1)
        if (onPayment) setTimeout(onPayment, 1000)
      } else {
        setError(data.error || 'Payment failed')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
    setActiveEndpoint(null)
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ color: '#00ff88', fontSize: 14, marginBottom: 2 }}>
            Demo Buyer - Test x402 Payments
          </h3>
          <span style={{ color: '#555', fontSize: 11 }}>
            Trigger a real x402 micropayment on Plasma. Agent earns USDT0 instantly.
          </span>
        </div>
        {paymentCount > 0 && (
          <span style={{ color: '#00ff88', fontSize: 11, background: '#00ff8815', padding: '2px 8px', borderRadius: 4 }}>
            {paymentCount} payment{paymentCount > 1 ? 's' : ''} sent
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => buy('analyze')}
          disabled={loading}
          style={{ ...btn, background: loading ? '#333' : '#00ff88', color: '#000', opacity: loading && activeEndpoint !== 'analyze' ? 0.5 : 1 }}
        >
          {loading && activeEndpoint === 'analyze' ? 'Signing x402 payment...' : 'Buy Market Analysis ($0.005)'}
        </button>
        <button
          onClick={() => buy('risk')}
          disabled={loading}
          style={{ ...btn, background: loading ? '#333' : '#00ccff', color: '#000', opacity: loading && activeEndpoint !== 'risk' ? 0.5 : 1 }}
        >
          {loading && activeEndpoint === 'risk' ? 'Signing x402 payment...' : 'Buy Risk Score ($0.003)'}
        </button>
      </div>

      {loading && (
        <div style={{ color: '#00ff88', fontSize: 12, marginBottom: 8, animation: 'pulse 1.5s infinite' }}>
          Processing x402 payment on Plasma...
        </div>
      )}

      {error && (
        <div style={{ background: '#ff444422', color: '#ff6644', padding: 10, borderRadius: 4, fontSize: 12, marginBottom: 8 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#00ff8811', border: '1px solid #00ff8833', padding: 12, borderRadius: 4, fontSize: 12 }}>
          <div style={{ color: '#00ff88', marginBottom: 6, fontWeight: 'bold' }}>
            x402 Payment Successful - Agent earned ${result.endpoint === 'analyze' ? '0.005' : '0.003'} USDT0
          </div>
          <pre style={{ color: '#aaa', fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', lineHeight: 1.4 }}>
            {JSON.stringify(result.response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
