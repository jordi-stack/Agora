import React, { useState } from 'react'

const card = { background: '#0d1117', borderRadius: 8, padding: 20, border: '1px solid #00ff8844' }
const btn = {
  padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13, fontWeight: 'bold', transition: 'all 0.2s',
}

export default function DemoBuyer({ onPayment }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const buy = async (endpoint) => {
    setLoading(true)
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
        if (onPayment) onPayment()
      } else {
        setError(data.error || 'Payment failed')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h3 style={{ color: '#00ff88', fontSize: 14, marginBottom: 2 }}>
            Demo Buyer — Test x402 Payments
          </h3>
          <span style={{ color: '#555', fontSize: 11 }}>
            Click to trigger a real x402 payment from Demo Buyer wallet
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <button
          onClick={() => buy('analyze')}
          disabled={loading}
          style={{ ...btn, background: loading ? '#333' : '#00ff88', color: '#000' }}
        >
          {loading ? 'Processing...' : '💰 Buy Market Analysis ($0.005)'}
        </button>
        <button
          onClick={() => buy('risk')}
          disabled={loading}
          style={{ ...btn, background: loading ? '#333' : '#00ccff', color: '#000' }}
        >
          {loading ? 'Processing...' : '🔍 Buy Risk Score ($0.003)'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#ff444422', color: '#ff6644', padding: 10, borderRadius: 4, fontSize: 12 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#00ff8811', border: '1px solid #00ff8833', padding: 12, borderRadius: 4, fontSize: 12 }}>
          <div style={{ color: '#00ff88', marginBottom: 6, fontWeight: 'bold' }}>Payment Successful!</div>
          <pre style={{ color: '#aaa', fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
            {JSON.stringify(result.response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
