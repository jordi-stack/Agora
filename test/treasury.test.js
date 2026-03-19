import { describe, it, expect } from 'vitest'
import { calculatePnL } from '../src/agent/treasury.js'

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
