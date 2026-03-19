import { describe, it, expect } from 'vitest'
import { checkSafety, SAFETY } from '../src/config/safety.js'

describe('Safety Rules', () => {
  it('returns green when all rules pass', () => {
    const result = checkSafety(2.0, 0, 2.0)
    expect(result.overall).toBe('green')
    expect(result.paused).toBe(false)
  })

  it('returns red and pauses when balance below minimum', () => {
    const result = checkSafety(0.3, 0, 0.5)
    expect(result.overall).toBe('red')
    expect(result.paused).toBe(true)
  })

  it('returns red when spending rate exceeded', () => {
    const result = checkSafety(1.0, 0.5, 1.0)
    expect(result.rules.find(r => r.name === 'spendingRate').status).toBe('red')
  })

  it('returns red on emergency balance drop', () => {
    const result = checkSafety(0.4, 0, 1.0) // 60% drop
    expect(result.rules.find(r => r.name === 'emergencyDrop').status).toBe('red')
    expect(result.paused).toBe(true)
  })

  it('returns yellow when approaching spending limit', () => {
    const result = checkSafety(1.0, 0.25, 1.0) // 125% of limit
    expect(result.rules.find(r => r.name === 'spendingRate').status).toBe('yellow')
  })

  it('has correct threshold values', () => {
    expect(SAFETY.minOperatingBalance).toBe(0.5)
    expect(SAFETY.maxSingleTx).toBe(0.1)
    expect(SAFETY.spendingRateLimit).toBe(0.2)
    expect(SAFETY.emergencyDropThreshold).toBe(0.5)
  })
})
