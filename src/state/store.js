import { Redis } from '@upstash/redis'

let redis = null
const mem = { revenue: [], expenses: [], decisions: [], txs: [], pricing: null, treasury: null }

export function initStore() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    console.log('[store] Redis connected')
  } else {
    console.log('[store] Using in-memory store (set UPSTASH_REDIS_REST_URL for persistence)')
  }
}

async function lpush(key, data) {
  const json = JSON.stringify(data)
  if (redis) await redis.lpush(key, json)
  if (!mem[key.split(':')[1]]) mem[key.split(':')[1]] = []
  mem[key.split(':')[1]].unshift(data)
  // Trim in-memory to 200 entries
  if (mem[key.split(':')[1]].length > 200) mem[key.split(':')[1]].length = 200
}

async function lrange(key, limit) {
  if (redis) {
    const items = await redis.lrange(key, 0, limit - 1)
    return items.map(i => typeof i === 'string' ? JSON.parse(i) : i)
  }
  return (mem[key.split(':')[1]] || []).slice(0, limit)
}

async function set(key, data) {
  if (redis) await redis.set(key, JSON.stringify(data))
  mem[key.split(':')[1]] = data
}

async function get(key) {
  if (redis) {
    const data = await redis.get(key)
    if (!data) return null
    return typeof data === 'string' ? JSON.parse(data) : data
  }
  return mem[key.split(':')[1]] || null
}

export const store = {
  addRevenue: (event) => lpush('agora:revenue', event),
  addExpense: (event) => lpush('agora:expenses', event),
  addDecision: (decision) => lpush('agora:decisions', decision),
  addTx: (receipt) => lpush('agora:txs', receipt),
  setPricing: (pricing) => set('agora:pricing', pricing),
  getPricing: () => get('agora:pricing'),
  setTreasury: (state) => set('agora:treasury', state),
  getTreasury: () => get('agora:treasury'),
  getRevenue: (limit = 50) => lrange('agora:revenue', limit),
  getExpenses: (limit = 50) => lrange('agora:expenses', limit),
  getDecisions: (limit = 20) => lrange('agora:decisions', limit),
  getTxs: (limit = 50) => lrange('agora:txs', limit),
}
