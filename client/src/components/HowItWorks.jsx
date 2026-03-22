import React, { useState } from 'react'
import { useT } from '../App.jsx'

export default function HowItWorks() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const section = { marginBottom: 20 }
  const title = { color: t.accent, fontWeight: 'bold', fontSize: 14, marginBottom: 6 }
  const text = { color: t.sub, fontSize: 12, lineHeight: 1.6 }
  const bullet = { color: t.sub, fontSize: 12, lineHeight: 1.6, paddingLeft: 12, marginTop: 4 }
  const divider = { borderBottom: `1px solid ${t.border}`, marginBottom: 20 }
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${t.accentBg}`, background: 'transparent', color: t.accent, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>? How It Works</button>
      {open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setOpen(false)}>
          <div style={{ background: t.card, borderRadius: 12, padding: 32, maxWidth: 640, width: '100%', border: `1px solid ${t.accent}44`, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ color: t.accent, fontSize: 20 }}>How Agora Works</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: 18 }}>X</button>
            </div>

            <p style={{ color: t.sub, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Agora is a self-sustaining AI agent that sells services, earns USD₮, and manages its own treasury autonomously on Sepolia.
            </p>

            <div style={divider} />

            <div style={section}>
              <div style={title}>Agent Performance</div>
              <div style={text}>Revenue earned from verified on-chain payments and profits saved to the Savings wallet.</div>
              <div style={bullet}>
                <span style={{ color: t.accent }}>Revenue</span> - real USD₮ received from service payments<br/>
                <span style={{ color: t.blue }}>Saved</span> - profits the agent autonomously moved to Savings
              </div>
            </div>

            <div style={section}>
              <div style={title}>Accounts (Sepolia)</div>
              <div style={text}>Three self-custodial BIP-44 wallets from one seed phrase via WDK.</div>
              <div style={bullet}>
                <span style={{ color: t.accent }}>Treasury (Acc 0)</span> - receives revenue, transfers profits to Savings<br/>
                <span style={{ color: t.blue }}>Savings (Acc 1)</span> - stores profits when Treasury exceeds 1.0 USD₮<br/>
                <span style={{ color: t.orange }}>Demo Buyer (Acc 2)</span> - pre-funded for testing payments
              </div>
              <div style={{ ...text, marginTop: 6, color: t.dim }}>Click any address to view on Sepolia Etherscan.</div>
            </div>

            <div style={section}>
              <div style={title}>Safety Status</div>
              <div style={text}>Four hard-coded rules the LLM cannot override. Green = safe, Red = agent paused.</div>
              <div style={bullet}>
                Minimum balance: 0.5 USD₮<br/>
                Max single transaction: 0.1 USD₮<br/>
                Spending rate: 5.0 USD₮/hour<br/>
                Emergency pause: balance drops more than 50% in one hour
              </div>
            </div>

            <div style={section}>
              <div style={title}>Dynamic Pricing</div>
              <div style={text}>The LLM autonomously adjusts service prices based on demand.</div>
              <div style={bullet}>
                High demand increases prices (up to 3x base)<br/>
                Low demand decreases prices (down to 0.5x base)<br/>
                Anti-thrashing logic prevents erratic changes between cycles
              </div>
            </div>

            <div style={divider} />

            <div style={section}>
              <div style={title}>Demo Buyer</div>
              <div style={text}>
                Click <b>"Buy Market Analysis"</b> ($0.005) or <b>"Buy Risk Score"</b> ($0.003) to trigger a real USD₮ transfer on Sepolia.
                Demo Buyer wallet pays Treasury wallet on-chain. The response includes a transaction hash you can verify on Sepolia Etherscan.
              </div>
            </div>

            <div style={divider} />

            <div style={section}>
              <div style={title}>Revenue Stream</div>
              <div style={text}>Real-time feed of every verified payment. Each entry shows the amount, endpoint, and a clickable transaction hash to Sepolia Etherscan.</div>
            </div>

            <div style={section}>
              <div style={title}>Agent Reasoning Trail</div>
              <div style={text}>Full log of every autonomous decision the agent makes every 5 minutes.</div>
              <div style={bullet}>
                <span style={{ color: t.muted }}>LLM Tools</span> - reasoning tools the LLM chose to call (check_balances, check_revenue, etc.)<br/>
                <span style={{ color: t.muted }}>WDK Tools</span> - MCP wallet operations triggered (getBalance, getTokenBalance, etc.)<br/>
                <span style={{ color: t.muted }}>Signed</span> - proof-of-life cryptographic signature using WDK sign()<br/>
                <span style={{ color: t.muted }}>Confidence</span> - decisions only execute at 0.7 or higher
              </div>
              <div style={{ ...text, marginTop: 6, color: t.dim }}>Click "?" on the Reasoning Trail for decision type explanations.</div>
            </div>

            <div style={{ marginTop: 24, padding: 14, background: t.accentBg, borderRadius: 8, fontSize: 11, color: t.muted, lineHeight: 1.6 }}>
              Built with Tether WDK (wdk-wallet-evm + wdk-mcp-toolkit, 15 tools) + x402 payment architecture + Groq LLaMA (tool-calling) on Sepolia testnet. State persists to disk across restarts. 50 unit tests. Apache 2.0.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
