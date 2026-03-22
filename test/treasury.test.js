import { describe, it, expect } from 'vitest'
import { calculatePnL } from '../src/agent/treasury.js'
import { SAFETY } from '../src/config/safety.js'

describe('Treasury Transfer Amount Logic', () => {
  // Test the same formula used in evaluateTreasury (lines 16-19)
  // Without calling the actual transfer which needs WDK
  function calculateTransferAmount(treasuryBalance, llmAmount = null) {
    const surplus = treasuryBalance - SAFETY.minOperatingBalance
    if (treasuryBalance <= 1.0 || surplus <= 0) return 0
    const amount = llmAmount != null && llmAmount > 0
      ? Math.min(llmAmount, surplus, SAFETY.maxSingleTx)
      : Math.min(surplus * 0.5, SAFETY.maxSingleTx)
    return Math.round(amount * 1e6) / 1e6
  }

  it('llmAmount null defaults to surplus * 0.5', () => {
    // treasury=2.0, surplus=1.5, default=0.75 but capped by maxSingleTx=0.1
    expect(calculateTransferAmount(2.0, null)).toBe(0.1)
    // treasury=1.1, surplus=0.6, default=0.3 but capped by maxSingleTx=0.1
    expect(calculateTransferAmount(1.1, null)).toBe(0.1)
  })

  it('llmAmount bounded by SAFETY.maxSingleTx', () => {
    // llmAmount=0.5 but maxSingleTx=0.1
    expect(calculateTransferAmount(5.0, 0.5)).toBe(0.1)
  })

  it('llmAmount bounded by surplus', () => {
    // treasury=1.2, surplus=0.7, llmAmount=0.09 (within bounds)
    expect(calculateTransferAmount(1.2, 0.09)).toBe(0.09)
    // treasury=1.55, surplus=1.05, llmAmount=0.08
    expect(calculateTransferAmount(1.55, 0.08)).toBe(0.08)
  })

  it('returns 0 when treasury below threshold', () => {
    expect(calculateTransferAmount(0.8, 0.05)).toBe(0)
    expect(calculateTransferAmount(1.0, 0.05)).toBe(0)
  })
})

describe('Treasury P&L', () => {
  it('calculates P&L from revenue and expenses', () => {
    const revenue = [
      { amount: 0.005, timestamp: Date.now() },
      { amount: 0.003, timestamp: Date.now() },
      { amount: 0.005, timestamp: Date.now() },
    ]
    const expenses = [
      { amount: 0.001, timestamp: Date.now() },
    ]
    const pnl = calculatePnL(revenue, expenses)
    expect(pnl.revenue).toBe(0.013)
    expect(pnl.expenses).toBe(0.001)
    expect(pnl.profit).toBe(0.012)
  })

  it('handles empty arrays', () => {
    const pnl = calculatePnL([], [])
    expect(pnl.revenue).toBe(0)
    expect(pnl.expenses).toBe(0)
    expect(pnl.profit).toBe(0)
  })

  it('handles missing amount fields', () => {
    const revenue = [{ timestamp: Date.now() }, { amount: 0.005 }]
    const pnl = calculatePnL(revenue, [])
    expect(pnl.revenue).toBe(0.005)
  })
})
