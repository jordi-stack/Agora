import { CHAIN } from '../config/chains.js'
import { getPrice, recordRequest } from './pricing.js'
import { store } from '../state/store.js'

let x402Enabled = false

export function isX402Enabled() { return x402Enabled }

export async function setupX402(app, sellerAddress) {
  const facilitatorUrl = process.env.FACILITATOR_URL || 'https://x402.semanticpay.io/'

  // Try to initialize x402 payment middleware with facilitator validation
  try {
    const { paymentMiddleware, x402ResourceServer } = await import('@x402/express')
    const { ExactEvmScheme } = await import('@x402/evm/exact/server')
    const { HTTPFacilitatorClient } = await import('@x402/core/server')

    const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl })
    const resourceServer = new x402ResourceServer(facilitatorClient)
      .register(CHAIN.network, new ExactEvmScheme())

    // Pre-initialize to catch facilitator errors early (before app.listen)
    await resourceServer.initialize()

    const paymentConfig = {
      'POST /api/analyze': {
        accepts: [{
          scheme: 'exact',
          network: CHAIN.network,
          price: {
            amount: String(getPrice('analyze')),
            asset: CHAIN.usdt0,
            extra: { name: 'USDT0', version: '1', decimals: 6 },
          },
          payTo: sellerAddress,
        }],
        description: 'AI Market Analysis powered by Agora Agent',
        mimeType: 'application/json',
      },
      'POST /api/risk': {
        accepts: [{
          scheme: 'exact',
          network: CHAIN.network,
          price: {
            amount: String(getPrice('risk')),
            asset: CHAIN.usdt0,
            extra: { name: 'USDT0', version: '1', decimals: 6 },
          },
          payTo: sellerAddress,
        }],
        description: 'Wallet Risk Scoring powered by Agora Agent',
        mimeType: 'application/json',
      },
    }

    app.use(paymentMiddleware(paymentConfig, resourceServer))
    x402Enabled = true
    console.log('[x402] Payment middleware active (facilitator verified)')
  } catch (err) {
    console.warn('[x402] Payment gate unavailable:', err.message)
    console.warn('[x402] Endpoints will run without x402 paywall (testnet mode)')
  }

  // Revenue logging middleware — only records real x402 payments
  app.use('/api/analyze', (req, res, next) => {
    if (req.method === 'POST') {
      recordRequest('analyze')
      if (x402Enabled) {
        store.addRevenue({
          timestamp: Date.now(),
          endpoint: 'analyze',
          amount: getPrice('analyze') / 1e6,
          type: 'x402',
        }).catch(() => {})
      }
    }
    next()
  })

  app.use('/api/risk', (req, res, next) => {
    if (req.method === 'POST') {
      recordRequest('risk')
      if (x402Enabled) {
        store.addRevenue({
          timestamp: Date.now(),
          endpoint: 'risk',
          amount: getPrice('risk') / 1e6,
          type: 'x402',
        }).catch(() => {})
      }
    }
    next()
  })

  console.log('[x402] Seller:', sellerAddress)
  console.log('[x402] Facilitator:', facilitatorUrl)
  console.log('[x402] Endpoints: POST /api/analyze ($' + (getPrice('analyze') / 1e6) + '), POST /api/risk ($' + (getPrice('risk') / 1e6) + ')')
}
