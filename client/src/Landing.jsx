import React, { useState, useEffect } from 'react'
import { getTheme } from './theme.js'

const TREASURY = '0x68447fC30c930b67D1492cA15E413191c9383C9b'
const FUNDING_TX = '0xb638844645e2d645f0625834ac2b2f193cd6f75780af57ad56c03ceeabac0ddf'

export default function Landing() {
  const [mode, setMode] = useState(() => localStorage.getItem('agora-theme') || 'dark')
  const [visible, setVisible] = useState({})
  const t = getTheme(mode)
  const toggle = () => { const n = mode === 'dark' ? 'light' : 'dark'; setMode(n); localStorage.setItem('agora-theme', n) }

  useEffect(() => { document.body.style.background = t.bg; document.body.style.color = t.text }, [mode])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.section]: true })) })
    }, { threshold: 0.1 })
    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const fadeIn = (id) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? 'translateY(0)' : 'translateY(24px)',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  })

  const card = {
    background: t.card,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    padding: 24,
  }

  const badge = (color, bg) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: color,
    background: bg,
    letterSpacing: 0.5,
  })

  const sectionTitle = {
    fontSize: 13,
    color: t.sub,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  }

  const sectionHeading = {
    fontSize: 22,
    color: t.text,
    fontWeight: 'bold',
    marginBottom: 24,
    lineHeight: 1.3,
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  }

  const th = {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: `2px solid ${t.border}`,
    color: t.sub,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }

  const td = {
    padding: '10px 12px',
    borderBottom: `1px solid ${t.border}`,
    color: t.text,
  }

  const tdMuted = { ...td, color: t.muted }

  const link = {
    color: t.accent,
    textDecoration: 'none',
  }

  const ctaBtn = {
    display: 'inline-block',
    padding: '12px 28px',
    background: t.accent,
    color: t.btnText,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 'bold',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: 0.5,
    transition: 'opacity 0.2s',
  }

  const ctaOutline = {
    ...ctaBtn,
    background: 'transparent',
    border: `1px solid ${t.border}`,
    color: t.accent,
  }

  const separator = {
    width: '100%',
    height: 1,
    background: t.border,
    margin: '64px 0',
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', background: t.bg, minHeight: '100vh', transition: 'background 0.3s' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="Agora" style={{ width: 28, height: 28 }} />
          <span style={{ fontSize: 16, fontWeight: 'bold', color: t.accent, letterSpacing: 2 }}>AGORA</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={toggle} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${t.border}`, background: t.card, color: t.sub, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            {mode === 'dark' ? '\u2600 Light' : '\uD83C\uDF19 Dark'}
          </button>
          <a href="#/app" style={ctaBtn}>Open Dashboard</a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '80px 0 64px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={badge(t.accent, t.accentBg)}>AUTONOMOUS</span>
          <span style={badge(t.blue, t.blueBg)}>SEPOLIA</span>
          <span style={badge(t.orange, mode === 'dark' ? '#ff664422' : '#cc552215')}>x402</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 'bold', color: t.text, lineHeight: 1.2, marginBottom: 16 }}>
          Self-Sustaining AI Agent
        </h1>
        <p style={{ fontSize: 15, color: t.muted, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Earns USD₮ by selling intelligence services via x402 micropayments, manages its own multi-account treasury through Tether WDK, and makes financial decisions on the Sepolia testnet.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#/app" style={ctaBtn}>Open Dashboard</a>
          <a href="https://github.com/jordi-stack/Agora" target="_blank" rel="noopener" style={ctaOutline}>View Source</a>
        </div>
      </div>

      {/* Architecture Flow */}
      <div data-section="flow" style={{ ...fadeIn('flow'), marginBottom: 64, padding: '20px 0' }}>
        <div style={{ ...sectionTitle, textAlign: 'center' }}>How It Works</div>
        <h2 style={{ ...sectionHeading, textAlign: 'center' }}>Architecture Flow</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {[
            { label: 'Buyers / Agents', sub: '/api/analyze ($0.005)\n/api/risk ($0.003)', color: t.muted, icon: '\u2193' },
            { label: 'x402 Revenue Engine', sub: 'Dynamic Pricing\nAuto-collect USD₮', color: t.orange, icon: '\u2193' },
            { label: 'Agent Brain (LLM)', sub: '5 min loop\nGroq + LLaMA', color: t.blue, icon: '\u2193' },
            { label: 'WDK MCP Toolkit', sub: '15 tools\ngetBalance | transfer', color: t.accent, icon: '\u2193' },
            { label: 'WDK Wallet', sub: 'Treasury | Savings\nDemo Buyer', color: t.accent, side: { label: 'Safety', sub: '4 rules\nenforced', color: t.red }, icon: '\u2193' },
            { label: 'Sepolia Testnet', sub: 'USD₮ | ETH\nEVM testnet', color: t.blue },
          ].map((node, i, arr) => (
            <React.Fragment key={node.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', maxWidth: 600, justifyContent: 'center' }}>
                <div style={{
                  ...card, borderRadius: 12, textAlign: 'center',
                  width: node.side ? 220 : 280,
                  animation: `nodeIn 0.4s ease ${i * 0.1}s both`,
                  borderColor: node.color + '33',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: node.color, marginBottom: 4 }}>{node.label}</div>
                  <div style={{ fontSize: 11, color: t.muted, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{node.sub}</div>
                </div>
                {node.side && (
                  <>
                    <svg width="36" height="10" viewBox="0 0 36 10" style={{ flexShrink: 0 }}>
                      <line x1="0" y1="5" x2="36" y2="5" stroke={node.side.color} strokeWidth="2" strokeDasharray="4,4" className="flow-dash-h" opacity="0.5" />
                    </svg>
                    <div style={{
                      ...card, borderRadius: 12, textAlign: 'center', width: 130, flexShrink: 0,
                      animation: `nodeIn 0.4s ease ${i * 0.1 + 0.05}s both`,
                      borderColor: node.side.color + '33',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 'bold', color: node.side.color, marginBottom: 2 }}>{node.side.label}</div>
                      <div style={{ fontSize: 10, color: t.muted }}>{node.side.sub}</div>
                    </div>
                  </>
                )}
              </div>
              {i < arr.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 32, justifyContent: 'center', margin: '2px 0' }}>
                  <svg width="20" height="32" viewBox="0 0 20 32">
                    <line x1="10" y1="0" x2="10" y2="24" stroke={node.color} strokeWidth="2" strokeDasharray="4,4" className="flow-dash-v" opacity="0.7" />
                    <polygon points="6,22 10,30 14,22" fill={node.color} opacity="0.5" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={badge(t.accent, t.accentBg)}>Self-Custodial</span>
            <span style={badge(t.blue, t.blueBg)}>On-Chain</span>
            <span style={badge(t.orange, mode === 'dark' ? '#ff664422' : '#cc552215')}>Real Revenue</span>
          </div>
        </div>
        <style>{`
          @keyframes nodeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .flow-dash-v {
            animation: dashMoveV 0.8s linear infinite;
          }
          .flow-dash-h {
            animation: dashMoveH 0.8s linear infinite;
          }
          @keyframes dashMoveV {
            to { stroke-dashoffset: -16; }
          }
          @keyframes dashMoveH {
            to { stroke-dashoffset: -16; }
          }
        `}</style>
      </div>

      <div style={separator} />

      {/* Earns / Decides / Manages */}
      <div data-section="pillars" style={{ ...fadeIn('pillars'), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 64 }}>
        {[
          { title: 'Earns', color: t.accent, desc: 'Sells market analysis and wallet risk scoring via x402 micropayments. Buyers pay USD₮ per request through standard HTTP.' },
          { title: 'Decides', color: t.blue, desc: 'Runs an autonomous loop every 5 minutes. The LLM evaluates revenue trends, adjusts pricing, and determines when to secure profits.' },
          { title: 'Manages', color: t.orange, desc: 'Surplus revenue gets transferred to a separate savings wallet via real on-chain transactions. Every decision is logged.' },
        ].map(p => (
          <div key={p.title} style={card}>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: p.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.6 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      <div style={separator} />

      {/* x402 Payment Flow */}
      <div data-section="x402" style={{ ...fadeIn('x402'), marginBottom: 64 }}>
        <div style={sectionTitle}>Revenue Engine</div>
        <h2 style={sectionHeading}>x402 Agentic Payments</h2>
        <p style={{ color: t.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          The agent sells services using the x402 HTTP payment protocol. Any buyer (human or agent) pays USD₮ per request. No API keys, no accounts, just HTTP.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={card}>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: t.accent, marginBottom: 6 }}>POST /api/analyze</div>
            <div style={{ fontSize: 13, color: t.text, marginBottom: 4 }}>Market Analysis</div>
            <div style={{ fontSize: 12, color: t.muted, marginBottom: 8 }}>Bitfinex/CoinGecko price data + LLM reasoning</div>
            <span style={badge(t.accent, t.accentBg)}>$0.005 USD₮</span>
          </div>
          <div style={card}>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: t.blue, marginBottom: 6 }}>POST /api/risk</div>
            <div style={{ fontSize: 13, color: t.text, marginBottom: 4 }}>Risk Scoring</div>
            <div style={{ fontSize: 12, color: t.muted, marginBottom: 8 }}>Sepolia RPC on-chain data + LLM assessment</div>
            <span style={badge(t.blue, t.blueBg)}>$0.003 USD₮</span>
          </div>
        </div>
      </div>

      <div style={separator} />

      {/* WDK Integration */}
      <div data-section="wdk" style={{ ...fadeIn('wdk'), marginBottom: 64 }}>
        <div style={sectionTitle}>Wallet Layer</div>
        <h2 style={sectionHeading}>Multi-Account Treasury (WDK)</h2>
        <p style={{ color: t.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Three BIP-44 accounts derived from a single seed phrase using <span style={{ fontFamily: 'monospace', color: t.text }}>@tetherto/wdk-wallet-evm</span>. Self-custodial, keys never leave the server.
        </p>
        <div style={card}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Account</th>
                <th style={th}>Index</th>
                <th style={th}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ ...td, color: t.accent, fontWeight: 'bold' }}>Treasury</td><td style={tdMuted}>0</td><td style={td}>Receives revenue, transfers profits to Savings</td></tr>
              <tr><td style={{ ...td, color: t.blue, fontWeight: 'bold' }}>Savings</td><td style={tdMuted}>1</td><td style={td}>Receives autonomous profit transfers</td></tr>
              <tr><td style={{ ...td, color: t.orange, fontWeight: 'bold' }}>Demo Buyer</td><td style={tdMuted}>2</td><td style={{ ...td, borderBottom: 'none' }}>Pre-funded to test payments</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={separator} />

      {/* Agent Autonomy */}
      <div data-section="autonomy" style={{ ...fadeIn('autonomy'), marginBottom: 64 }}>
        <div style={sectionTitle}>Agent Brain</div>
        <h2 style={sectionHeading}>Autonomous Decision Loop</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={card}>
            <div style={{ fontSize: 12, color: t.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Every 5 Minutes</div>
            {[
              { n: '1', label: 'Check USD₮ + ETH balances via WDK' },
              { n: '2', label: 'Analyze revenue trends from state history' },
              { n: '3', label: 'Query LLM for decision (hold / transfer / reprice)' },
              { n: '4', label: 'Execute if confidence >= 0.7' },
              { n: '5', label: 'Log full reasoning trail' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ ...badge(t.accent, t.accentBg), minWidth: 22, textAlign: 'center', marginTop: 1 }}>{s.n}</span>
                <span style={{ fontSize: 13, color: t.text, lineHeight: 1.4 }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontSize: 12, color: t.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Safety Rules</div>
            <p style={{ fontSize: 12, color: t.muted, marginBottom: 16 }}>Hard-coded rules the agent cannot override:</p>
            <table style={tableStyle}>
              <tbody>
                <tr><td style={{ ...td, fontSize: 12 }}>Min operating balance</td><td style={{ ...td, color: t.accent, fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }}>0.5 USD₮</td></tr>
                <tr><td style={{ ...td, fontSize: 12 }}>Max single transaction</td><td style={{ ...td, color: t.accent, fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }}>0.1 USD₮</td></tr>
                <tr><td style={{ ...td, fontSize: 12 }}>Spending rate limit</td><td style={{ ...td, color: t.accent, fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }}>5.0/hour</td></tr>
                <tr><td style={{ ...td, fontSize: 12, borderBottom: 'none' }}>Emergency pause</td><td style={{ ...td, color: t.red, fontFamily: 'monospace', fontSize: 12, borderBottom: 'none', textAlign: 'right' }}>&gt;50% drop/hr</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={separator} />

      {/* On-Chain Proof */}
      <div data-section="proof" style={{ ...fadeIn('proof'), marginBottom: 64 }}>
        <div style={sectionTitle}>Verification</div>
        <h2 style={sectionHeading}>On-Chain Proof</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <a href={`https://sepolia.etherscan.io/address/${TREASURY}`} target="_blank" rel="noopener" style={{ ...card, textDecoration: 'none', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: 11, color: t.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Treasury Address</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: t.accent, wordBreak: 'break-all' }}>{TREASURY}</div>
            <div style={{ fontSize: 11, color: t.dim, marginTop: 8 }}>View on Etherscan &#8599;</div>
          </a>
          <a href={`https://sepolia.etherscan.io/tx/${FUNDING_TX}`} target="_blank" rel="noopener" style={{ ...card, textDecoration: 'none', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: 11, color: t.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Demo Buyer Funding TX</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: t.blue, wordBreak: 'break-all' }}>{FUNDING_TX.slice(0, 24)}...</div>
            <div style={{ fontSize: 11, color: t.dim, marginTop: 8 }}>View on Etherscan &#8599;</div>
          </a>
        </div>
      </div>

      <div style={separator} />

      {/* Tech Stack */}
      <div data-section="tech" style={{ ...fadeIn('tech'), marginBottom: 64 }}>
        <div style={sectionTitle}>Built With</div>
        <h2 style={sectionHeading}>Tech Stack</h2>
        <div style={card}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Layer</th>
                <th style={th}>Technology</th>
                <th style={{ ...th, display: 'none', '@media (min-width: 640px)': { display: 'table-cell' } }}>Why</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Wallet', '@tetherto/wdk-wallet-evm', 'Self-custodial, BIP-44, multi-account'],
                ['Agent Framework', 'WDK MCP Toolkit', '15 MCP tools for wallet operations'],
                ['Payments', 'x402 Protocol (@x402/express)', 'HTTP-native agentic micropayments'],
                ['LLM', 'Groq + LLaMA (open-source)', 'Universal provider, auto-detected'],
                ['Chain', 'Sepolia (eip155:11155111)', 'EVM testnet with WDK support'],
                ['State', 'In-memory store', 'No external dependencies'],
                ['Indexer', 'WDK Indexer API', 'Official Tether balances + transfers'],
                ['Server', 'Express.js', 'x402 middleware compatible'],
                ['Frontend', 'React + Vite', 'Lightweight, fast builds'],
                ['Testing', 'Vitest', '30 unit tests'],
              ].map(([layer, tech, why], i, arr) => (
                <tr key={layer}>
                  <td style={{ ...td, fontWeight: 'bold', fontSize: 12, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>{layer}</td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: t.accent, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>{tech}</td>
                  <td style={{ ...tdMuted, fontSize: 12, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={separator} />

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 0 60px' }}>
        <div style={{ marginBottom: 24 }}>
          <a href="#/app" style={ctaBtn}>Open Dashboard</a>
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <a href="https://github.com/jordi-stack/Agora" target="_blank" rel="noopener" style={{ ...link, fontSize: 12 }}>GitHub</a>
          <a href="https://dorahacks.io/hackathon/hackathon-galactica-wdk-2026-01/detail" target="_blank" rel="noopener" style={{ ...link, fontSize: 12 }}>Hackathon</a>
          <a href={`https://sepolia.etherscan.io/address/${TREASURY}`} target="_blank" rel="noopener" style={{ ...link, fontSize: 12 }}>Etherscan</a>
        </div>
        <div style={{ color: t.dim, fontSize: 10 }}>
          Agora - Hackathon Galactica: WDK Edition 1 - Apache 2.0
        </div>
      </div>

    </div>
  )
}
