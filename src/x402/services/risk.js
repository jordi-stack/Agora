import { assessRisk } from '../../agent/reasoning.js'
import { getProvider } from '../../agent/llm.js'
import { PLASMA } from '../../config/chains.js'

export async function handleRisk(req, res) {
  try {
    const { address } = req.body || {}
    if (!address) return res.status(400).json({ error: 'address required' })

    // Fetch on-chain data via Plasma RPC
    const [balanceHex, txCountHex] = await Promise.all([
      rpcCall('eth_getBalance', [address, 'latest']),
      rpcCall('eth_getTransactionCount', [address, 'latest']),
    ])

    const balance = parseInt(balanceHex, 16) / 1e18
    const txCount = parseInt(txCountHex, 16)

    const aiAssessment = await assessRisk(address, { balance, txCount })

    // Extract score from AI response
    const scoreMatch = aiAssessment.match(/(\d{1,3})/)
    const riskScore = scoreMatch ? Math.min(100, parseInt(scoreMatch[1])) : 50

    res.json({
      address,
      timestamp: Date.now(),
      riskScore,
      tier: riskScore < 30 ? 'Low' : riskScore < 70 ? 'Medium' : 'High',
      onChainData: { balance, txCount, chain: 'Plasma' },
      aiAssessment,
      confidence: 0.75,
      source: 'agora-agent',
      poweredBy: `Plasma RPC + ${getProvider()}`,
      explorer: PLASMA.explorerAddress(address),
    })
  } catch (err) {
    res.status(500).json({ error: err.message, source: 'agora-agent' })
  }
}

async function rpcCall(method, params) {
  const res = await fetch(PLASMA.rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  })
  const data = await res.json()
  return data.result
}
