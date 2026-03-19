const mem = { revenue: [], expenses: [], decisions: [], txs: [], pricing: null, treasury: null }

export function initStore() {
  console.log('[store] In-memory store initialized')
}

async function lpush(key, data) {
  const k = key.split(':')[1]
  if (!mem[k]) mem[k] = []
  mem[k].unshift(data)
  if (mem[k].length > 200) mem[k].length = 200
}

async function lrange(key, limit) {
  return (mem[key.split(':')[1]] || []).slice(0, limit)
}

async function set(key, data) {
  mem[key.split(':')[1]] = data
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
