import { Router } from 'express'
import { getBalances, getAccount, getAddresses } from '../wallet/manager.js'
import { getPrices, getRequestVolume, getPriceHistory } from '../x402/pricing.js'
import { checkSafety } from '../config/safety.js'
import { calculatePnL } from '../agent/treasury.js'
import { store } from '../state/store.js'
import { getProvider } from '../agent/llm.js'

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
    const safety = checkSafety(balances.treasury.native, recentExpenses, balances.treasury.native)

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

// Demo buyer — judges click this to test x402
router.post('/api/demo-buy', async (req, res) => {
  try {
    const { x402Client, wrapFetchWithPayment } = await import('@x402/fetch')
    const { registerExactEvmScheme } = await import('@x402/evm/exact/client')

    const demoBuyerAccount = getAccount('demoBuyer')
    const client = new x402Client()
    registerExactEvmScheme(client, { signer: demoBuyerAccount })
    const fetchWithPayment = wrapFetchWithPayment(fetch, client)

    const endpoint = req.body?.endpoint || 'analyze'
    const port = process.env.PORT || 3000
    const host = req.headers.host || `localhost:${port}`
    const protocol = req.secure ? 'https' : 'http'
    const url = `${protocol}://${host}/api/${endpoint}`

    const body = endpoint === 'risk'
      ? { address: getAddresses().treasury }
      : { asset: req.body?.asset || 'BTC' }

    const response = await fetchWithPayment(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    res.json({ success: true, endpoint, response: data, status: response.status })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Health check
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agent: 'agora', uptime: process.uptime() })
})

export default router
