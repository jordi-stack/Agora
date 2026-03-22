import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'

const STATE_FILE = 'data/agora-state.json'
const DEBOUNCE_MS = 5000

const mem = { revenue: [], expenses: [], decisions: [], txs: [], pricing: null, treasury: null }

let debounceTimer = null

export function flushToDisk() {
  mkdirSync('data', { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(mem, null, 2), 'utf8')
}

function scheduleSave() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    flushToDisk()
  }, DEBOUNCE_MS)
}

export function initStore() {
  if (existsSync(STATE_FILE)) {
    try {
      const raw = readFileSync(STATE_FILE, 'utf8')
      const saved = JSON.parse(raw)
      if (saved.revenue) mem.revenue = saved.revenue
      if (saved.expenses) mem.expenses = saved.expenses
      if (saved.decisions) mem.decisions = saved.decisions
      if (saved.txs) mem.txs = saved.txs
      if (saved.pricing !== undefined) mem.pricing = saved.pricing
      if (saved.treasury !== undefined) mem.treasury = saved.treasury
      console.log('[store] Loaded persisted state from', STATE_FILE)
    } catch (err) {
      console.warn('[store] Failed to load state file, starting fresh:', err.message)
    }
  } else {
    console.log('[store] No state file found, starting fresh')
  }
}

async function lpush(key, data) {
  const k = key.split(':')[1]
  if (!mem[k]) mem[k] = []
  mem[k].unshift(data)
  if (mem[k].length > 200) mem[k].length = 200
  scheduleSave()
}

async function lrange(key, limit) {
  return (mem[key.split(':')[1]] || []).slice(0, limit)
}

async function set(key, data) {
  mem[key.split(':')[1]] = data
  scheduleSave()
}

async function get(key) {
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
