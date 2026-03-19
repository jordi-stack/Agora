import { describe, it, expect, beforeEach } from 'vitest'
import { getPrice, getPriceHuman, recordRequest, adjustPrices, getPrices, getRequestVolume, resetHourlyCounters } from '../src/x402/pricing.js'

describe('Dynamic Pricing', () => {
  beforeEach(() => {
    resetHourlyCounters()
  })

  it('returns base price for analyze', () => {
    expect(getPrice('analyze')).toBe(5000) // $0.005
  })

  it('returns base price for risk', () => {
    expect(getPrice('risk')).toBe(3000) // $0.003
  })

  it('returns human readable price', () => {
    expect(getPriceHuman('analyze')).toBe(0.005)
    expect(getPriceHuman('risk')).toBe(0.003)
  })

  it('tracks request volume', () => {
    recordRequest('analyze')
    recordRequest('analyze')
    recordRequest('risk')
    const volume = getRequestVolume()
    expect(volume.analyze).toBe(2)
    expect(volume.risk).toBe(1)
    expect(volume.total).toBe(3)
  })

  it('adjusts prices with multiplier', () => {
    adjustPrices(2.0, 'high demand')
    expect(getPrice('analyze')).toBe(10000) // doubled
    expect(getPrice('risk')).toBe(6000)
  })

  it('clamps multiplier between 0.5 and 3.0', () => {
    adjustPrices(10.0, 'extreme')
    expect(getPrice('analyze')).toBe(15000) // capped at 3x
    adjustPrices(0.1, 'very low')
    expect(getPrice('analyze')).toBe(2500) // capped at 0.5x
  })

  it('resets hourly counters', () => {
    recordRequest('analyze')
    recordRequest('risk')
    resetHourlyCounters()
    const volume = getRequestVolume()
    expect(volume.total).toBe(0)
  })
})
