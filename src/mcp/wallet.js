import { getMCP } from './server.js'
import { getBalances as getBalancesFallback } from '../wallet/manager.js'
import { PLASMA } from '../config/chains.js'

let toolCalls = []

async function mcpTool(name, params, fn) {
  toolCalls.push(name)
  const start = Date.now()
  const result = await fn()
  console.log(`[mcp] tool: ${name}(${Object.values(params).join(', ')}) -> ${result} (${Date.now() - start}ms)`)
  return result
}

export function getRecentToolCalls() {
  const calls = [...toolCalls]
  toolCalls = []
  return calls
}

export async function getBalances() {
  const mcp = getMCP()
  if (!mcp) return getBalancesFallback()

  try {
    const [treasury, savings, demoBuyer] = await Promise.all([
      getAccountBalances(mcp, 0),
      getAccountBalances(mcp, 1),
      getAccountBalances(mcp, 2),
    ])
    return { treasury, savings, demoBuyer }
  } catch (err) {
    console.warn('[mcp] getBalances failed, fallback to manager:', err.message)
    return getBalancesFallback()
  }
}

async function getAccountBalances(mcp, index) {
  const names = ['treasury', 'savings', 'demoBuyer']
  const label = names[index] || `account${index}`

  const account = await mcp.wdk.getAccount('plasma', index)

  const address = await mcpTool('getAddress', { account: label },
    () => account.getAddress())

  const native = await mcpTool('getBalance', { account: label },
    async () => {
      try { return Number(await account.getBalance()) / 1e18 } catch { return 0 }
    })

  let usdt0 = 0
  if (process.env.WDK_INDEXER_API_KEY) {
    usdt0 = await mcpTool('getIndexerTokenBalance', { account: label },
      async () => {
        try {
          const res = await fetch(`https://wdk-api.tether.io/api/v1/plasma/usdt/${address}/token-balances`, {
            headers: { 'x-api-key': process.env.WDK_INDEXER_API_KEY },
            signal: AbortSignal.timeout(5000),
          })
          if (res.ok) {
            const data = await res.json()
            return parseFloat(data.tokenBalance?.amount || '0')
          }
        } catch {}
        return 0
      })
  }
  if (usdt0 === 0) {
    usdt0 = await mcpTool('getTokenBalance', { account: label },
      async () => {
        try {
          const res = await fetch(PLASMA.rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0', method: 'eth_call', id: 1,
              params: [{ to: PLASMA.usdt0, data: '0x70a08231000000000000000000000000' + address.slice(2).toLowerCase() }, 'latest'],
            }),
          })
          const data = await res.json()
          return parseInt(data.result, 16) / 1e6
        } catch { return 0 }
      })
  }

  return { native, usdt0, address }
}
