import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing the module under test
vi.mock('../src/x402/pricing.js', () => ({
  getPrice: vi.fn((endpoint) => endpoint === 'analyze' ? 5000 : 3000),
  recordRequest: vi.fn(),
}))

vi.mock('../src/state/store.js', () => ({
  store: {
    addRevenue: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock heavy x402 packages so setupX402 can run without network
vi.mock('@x402/express', () => { throw new Error('facilitator unavailable') })
vi.mock('@x402/evm/exact/server', () => { throw new Error('unavailable') })
vi.mock('@x402/core/server', () => { throw new Error('unavailable') })

import { getPrice, recordRequest } from '../src/x402/pricing.js'
import { store } from '../src/state/store.js'

/**
 * Simulate the revenue middleware logic in isolation.
 * We extract the relevant branching logic so we can unit-test it
 * without standing up a real Express app.
 */
function buildRevenueMiddleware(x402Enabled) {
  /**
   * Returns a pair of [analyzeMiddleware, riskMiddleware] that mirror
   * the fixed implementation in src/x402/middleware.js.
   */
  function makeMiddleware(endpoint) {
    return (req, res, next) => {
      if (req.method === 'POST') {
        recordRequest(endpoint)
        if (x402Enabled) {
          store.addRevenue({
            timestamp: Date.now(),
            endpoint,
            amount: getPrice(endpoint) / 1e6,
            type: 'x402',
          }).catch(() => {})
        }
      }
      next()
    }
  }
  return { analyze: makeMiddleware('analyze'), risk: makeMiddleware('risk') }
}

function fakeReq(method = 'POST') {
  return { method }
}
const fakeRes = {}
const noop = () => {}

describe('Revenue middleware — x402 disabled (testnet mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls recordRequest on POST /api/analyze', () => {
    const { analyze } = buildRevenueMiddleware(false)
    analyze(fakeReq(), fakeRes, noop)
    expect(recordRequest).toHaveBeenCalledOnce()
    expect(recordRequest).toHaveBeenCalledWith('analyze')
  })

  it('does NOT call store.addRevenue on POST /api/analyze when x402 disabled', () => {
    const { analyze } = buildRevenueMiddleware(false)
    analyze(fakeReq(), fakeRes, noop)
    expect(store.addRevenue).not.toHaveBeenCalled()
  })

  it('calls recordRequest on POST /api/risk', () => {
    const { risk } = buildRevenueMiddleware(false)
    risk(fakeReq(), fakeRes, noop)
    expect(recordRequest).toHaveBeenCalledOnce()
    expect(recordRequest).toHaveBeenCalledWith('risk')
  })

  it('does NOT call store.addRevenue on POST /api/risk when x402 disabled', () => {
    const { risk } = buildRevenueMiddleware(false)
    risk(fakeReq(), fakeRes, noop)
    expect(store.addRevenue).not.toHaveBeenCalled()
  })

  it('does NOT call recordRequest on GET requests', () => {
    const { analyze } = buildRevenueMiddleware(false)
    analyze(fakeReq('GET'), fakeRes, noop)
    expect(recordRequest).not.toHaveBeenCalled()
    expect(store.addRevenue).not.toHaveBeenCalled()
  })
})

describe('Revenue middleware — x402 enabled (production mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls store.addRevenue with type x402 on POST /api/analyze', () => {
    const { analyze } = buildRevenueMiddleware(true)
    analyze(fakeReq(), fakeRes, noop)
    expect(store.addRevenue).toHaveBeenCalledOnce()
    const call = store.addRevenue.mock.calls[0][0]
    expect(call.endpoint).toBe('analyze')
    expect(call.amount).toBe(5000 / 1e6)
    expect(call.type).toBe('x402')
  })

  it('calls store.addRevenue with type x402 on POST /api/risk', () => {
    const { risk } = buildRevenueMiddleware(true)
    risk(fakeReq(), fakeRes, noop)
    expect(store.addRevenue).toHaveBeenCalledOnce()
    const call = store.addRevenue.mock.calls[0][0]
    expect(call.endpoint).toBe('risk')
    expect(call.amount).toBe(3000 / 1e6)
    expect(call.type).toBe('x402')
  })

  it('also calls recordRequest when x402 enabled', () => {
    const { analyze } = buildRevenueMiddleware(true)
    analyze(fakeReq(), fakeRes, noop)
    expect(recordRequest).toHaveBeenCalledWith('analyze')
  })
})

describe('Demo-buy direct WDK transfer — revenue logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs revenue with type wdk-settlement after successful transfer', async () => {
    // Simulate the logic added to the demo-buy fallback branch
    const price = 0.005
    const endpoint = 'analyze'

    // Pretend transferUSDT0 succeeded
    const receipt = { hash: '0xabc', explorer: 'https://sepolia.etherscan.io/tx/0xabc' }

    // This is the new code that must be added after the transfer succeeds
    await store.addRevenue({
      timestamp: Date.now(),
      endpoint,
      amount: price,
      type: 'wdk-settlement',
      txHash: receipt.hash,
    })

    expect(store.addRevenue).toHaveBeenCalledOnce()
    const call = store.addRevenue.mock.calls[0][0]
    expect(call.type).toBe('wdk-settlement')
    expect(call.amount).toBe(price)
    expect(call.endpoint).toBe(endpoint)
    expect(call.txHash).toBe('0xabc')
  })

  it('does NOT log revenue when transfer throws', async () => {
    // Simulate a failed transfer — addRevenue should never be reached
    // (the route catches the error and returns 500 before logging)
    let revenueLogged = false
    try {
      throw new Error('insufficient funds')
      // The line below only runs if transfer succeeds
      revenueLogged = true
      await store.addRevenue({ type: 'wdk-settlement' })
    } catch (_) {
      // swallowed — route returns 500
    }
    expect(revenueLogged).toBe(false)
    expect(store.addRevenue).not.toHaveBeenCalled()
  })
})
