import { paymentMiddleware, x402ResourceServer } from '@x402/express'
import { ExactEvmScheme } from '@x402/evm/exact/server'
import { HTTPFacilitatorClient } from '@x402/core/server'
import { PLASMA } from '../config/chains.js'
import { getPrice, recordRequest } from './pricing.js'
import { store } from '../state/store.js'

export function setupX402(app, sellerAddress) {
  const facilitatorUrl = process.env.FACILITATOR_URL || 'https://x402.semanticpay.io/'

  const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl })
  const resourceServer = new x402ResourceServer(facilitatorClient)
    .register(PLASMA.network, new ExactEvmScheme())

  const paymentConfig = {
    'POST /api/analyze': {
      accepts: [{
        scheme: 'exact',
        network: PLASMA.network,
        price: {
          amount: String(getPrice('analyze')),
          asset: PLASMA.usdt0,
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
        network: PLASMA.network,
        price: {
          amount: String(getPrice('risk')),
          asset: PLASMA.usdt0,
          extra: { name: 'USDT0', version: '1', decimals: 6 },
        },
        payTo: sellerAddress,
      }],
      description: 'Wallet Risk Scoring powered by Agora Agent',
      mimeType: 'application/json',
    },
  }

  app.use(paymentMiddleware(paymentConfig, resourceServer))

  // Revenue logging middleware (runs AFTER x402 payment succeeds)
  app.use('/api/analyze', (req, res, next) => {
    if (req.method === 'POST') {
      recordRequest('analyze')
      store.addRevenue({
        timestamp: Date.now(),
        endpoint: 'analyze',
        amount: getPrice('analyze') / 1e6,
      }).catch(() => {})
    }
    next()
  })

  app.use('/api/risk', (req, res, next) => {
    if (req.method === 'POST') {
      recordRequest('risk')
      store.addRevenue({
        timestamp: Date.now(),
        endpoint: 'risk',
        amount: getPrice('risk') / 1e6,
      }).catch(() => {})
    }
    next()
  })

  console.log('[x402] Payment middleware configured')
  console.log('[x402] Seller:', sellerAddress)
  console.log('[x402] Facilitator:', facilitatorUrl)
  console.log('[x402] Endpoints: POST /api/analyze ($' + (getPrice('analyze') / 1e6) + '), POST /api/risk ($' + (getPrice('risk') / 1e6) + ')')
}
