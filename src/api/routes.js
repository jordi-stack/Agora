import { Router } from 'express'
import { getBalances, getAccount, getAddresses } from '../wallet/manager.js'
import { getPrices, getRequestVolume, getPriceHistory } from '../x402/pricing.js'
import { checkSafety } from '../config/safety.js'
import { calculatePnL } from '../agent/treasury.js'
import { store } from '../state/store.js'
import { getProvider } from '../agent/llm.js'
import { isIndexerEnabled, getTokenBalance, getTokenTransfers } from '../state/indexer.js'

const router = Router()

// Dashboard status — polled every 10s
router.get('/api/status', async (req, res) => {
  try {
    const balances = await getBalances()
    const pricing = getPrices()
    const volume = getRequestVolume()
    const revenue = await store.getRevenue(100)
    const expenses = await store.getExpenses(100)
    const pnl = calculatePnL(revenue, expenses)

    const recentExpenses = expenses
      .filter(e => Date.now() - e.timestamp < 3600000)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
    const recentRevenue = revenue
      .filter(r => Date.now() - r.timestamp < 3600000)
      .reduce((sum, r) => sum + (r.amount || 0), 0)
    const balanceOneHourAgo = (balances.treasury.usdt0 || 0) - recentRevenue + recentExpenses
    const safety = checkSafety(balances.treasury.usdt0 || 0, recentExpenses, balanceOneHourAgo)

    res.json({
      agent: 'agora',
      treasury: balances.treasury,
      savings: balances.savings,
      demoBuyer: balances.demoBuyer,
      pnl,
      pricing,
      volume,
      safety,
      llmProvider: getProvider(),
      lastUpdated: Date.now(),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Revenue + expense + decision history
router.get('/api/history', async (req, res) => {
  try {
    const [revenue, expenses, decisions, txs] = await Promise.all([
      store.getRevenue(), store.getExpenses(), store.getDecisions(), store.getTxs(),
    ])
    res.json({ revenue, expenses, decisions, txs })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Agent reasoning trail
router.get('/api/reasoning', async (req, res) => {
  try {
    const decisions = await store.getDecisions()
    res.json({ decisions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Pricing history
router.get('/api/pricing-history', async (req, res) => {
  res.json({ history: getPriceHistory() })
})

// Demo buyer — triggers a test x402 payment (with direct WDK transfer fallback)
router.post('/api/demo-buy', async (req, res) => {
  const allowed = ['analyze', 'risk']
  const endpoint = allowed.includes(req.body?.endpoint) ? req.body.endpoint : 'analyze'
  const port = process.env.PORT || 4747
  const url = `http://localhost:${port}/api/${endpoint}`
  const body = endpoint === 'risk'
    ? { address: getAddresses().treasury }
    : { asset: req.body?.asset || 'BTC' }

  // Try x402 payment flow first (production path)
  try {
    const { x402Client, wrapFetchWithPayment } = await import('@x402/fetch')
    const { registerExactEvmScheme } = await import('@x402/evm/exact/client')
    const demoBuyerAccount = getAccount('demoBuyer')
    const client = new x402Client()
    registerExactEvmScheme(client, { signer: demoBuyerAccount })
    const fetchWithPayment = wrapFetchWithPayment(fetch, client)

    const response = await fetchWithPayment(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return res.json({ success: true, endpoint, response: data, paymentMethod: 'x402' })
  } catch (x402Err) {
    console.warn('[demo-buy] x402 payment failed, using direct WDK transfer:', x402Err.message)
  }

  // Fallback: direct WDK transfer + call endpoint
  try {
    const { transferUSDT0 } = await import('../wallet/tx-pipeline.js')
    const demoBuyerAccount = getAccount('demoBuyer')
    const treasuryAddress = getAddresses().treasury
    const price = endpoint === 'analyze' ? 0.005 : 0.003

    // Real on-chain transfer via WDK
    const receipt = await transferUSDT0(demoBuyerAccount, treasuryAddress, price, `Demo x402 payment: ${endpoint}`)

    // Call endpoint directly
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await response.json()

    return res.json({
      success: true,
      endpoint,
      response: data,
      paymentMethod: 'direct-wdk-transfer',
      txHash: receipt.hash,
      explorer: receipt.explorer,
      amount: price,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// On-chain transfer history via WDK Indexer API
router.get('/api/transfers', async (req, res) => {
  if (!isIndexerEnabled()) {
    return res.json({ enabled: false, message: 'Set WDK_INDEXER_API_KEY to enable' })
  }
  try {
    const addresses = getAddresses()
    const [treasuryTransfers, savingsTransfers] = await Promise.all([
      getTokenTransfers('sepolia', 'usdt', addresses.treasury, 20),
      getTokenTransfers('sepolia', 'usdt', addresses.savings, 20),
    ])
    res.json({
      enabled: true,
      treasury: treasuryTransfers,
      savings: savingsTransfers,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Health check
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agent: 'agora', uptime: process.uptime(), indexer: isIndexerEnabled() })
})

export default router
