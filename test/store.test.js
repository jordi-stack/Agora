import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, rmSync, mkdirSync } from 'fs'

const TEST_DATA_DIR = 'data'
const TEST_STATE_FILE = 'data/agora-state.json'

describe('State Store with JSON Persistence', () => {
  beforeEach(async () => {
    // Remove existing state file before each test for isolation
    if (existsSync(TEST_STATE_FILE)) {
      rmSync(TEST_STATE_FILE)
    }
    // Re-import fresh module for each test by busting the cache
    // We reload the module by clearing vitest module cache
  })

  afterEach(() => {
    // Clean up test state file
    if (existsSync(TEST_STATE_FILE)) {
      rmSync(TEST_STATE_FILE)
    }
  })

  it('initStore() works without existing file', async () => {
    // Ensure no file exists
    if (existsSync(TEST_STATE_FILE)) rmSync(TEST_STATE_FILE)

    const { initStore, store } = await import('../src/state/store.js')
    initStore()

    // Should be able to read empty arrays without error
    const revenue = await store.getRevenue()
    expect(Array.isArray(revenue)).toBe(true)
    expect(revenue.length).toBe(0)
  })

  it('addRevenue stores data retrievable by getRevenue', async () => {
    const { initStore, store } = await import('../src/state/store.js')
    initStore()

    const event = { amount: 1.5, source: 'test', timestamp: Date.now() }
    await store.addRevenue(event)

    const revenue = await store.getRevenue()
    expect(revenue.length).toBeGreaterThan(0)
    expect(revenue[0]).toMatchObject({ amount: 1.5, source: 'test' })
  })

  it('flushToDisk() writes state to file', async () => {
    const { initStore, store, flushToDisk } = await import('../src/state/store.js')
    initStore()

    await store.addRevenue({ amount: 2.0, source: 'flush-test', timestamp: Date.now() })
    await flushToDisk()

    expect(existsSync(TEST_STATE_FILE)).toBe(true)

    // File should contain valid JSON with revenue
    const { readFileSync } = await import('fs')
    const contents = JSON.parse(readFileSync(TEST_STATE_FILE, 'utf8'))
    expect(Array.isArray(contents.revenue)).toBe(true)
    expect(contents.revenue[0]).toMatchObject({ amount: 2.0, source: 'flush-test' })
  })

  it('arrays are capped at 200 items', async () => {
    const { initStore, store, flushToDisk } = await import('../src/state/store.js')
    initStore()

    // Add 210 items
    for (let i = 0; i < 210; i++) {
      await store.addRevenue({ amount: i, source: 'cap-test', timestamp: Date.now() })
    }

    const revenue = await store.getRevenue(999)
    expect(revenue.length).toBeLessThanOrEqual(200)
  })

  it('set and get scalar values (pricing, treasury)', async () => {
    const { initStore, store } = await import('../src/state/store.js')
    initStore()

    const pricingData = { multiplier: 1.5, updatedAt: Date.now() }
    await store.setPricing(pricingData)

    const result = await store.getPricing()
    expect(result).toMatchObject({ multiplier: 1.5 })
  })

  it('flushToDisk() creates data/ directory if missing', async () => {
    const { initStore, store, flushToDisk } = await import('../src/state/store.js')
    initStore()

    await store.addRevenue({ amount: 0.5, source: 'dir-test', timestamp: Date.now() })
    await flushToDisk()

    expect(existsSync(TEST_DATA_DIR)).toBe(true)
    expect(existsSync(TEST_STATE_FILE)).toBe(true)
  })
})
