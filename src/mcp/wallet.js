import { getMCP } from './server.js'
import { getBalances as getBalancesFallback } from '../wallet/manager.js'
import { PLASMA } from '../config/chains.js'

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
  const account = await mcp.wdk.getAccount('plasma', index)
  const address = await account.getAddress()

  let native = 0
  try { native = Number(await account.getBalance()) / 1e18 } catch {}

  let usdt0 = 0
  if (process.env.WDK_INDEXER_API_KEY) {
    try {
      const res = await fetch(`https://wdk-api.tether.io/api/v1/plasma/usdt/${address}/token-balances`, {
        headers: { 'x-api-key': process.env.WDK_INDEXER_API_KEY },
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const data = await res.json()
        usdt0 = parseFloat(data.tokenBalance?.amount || '0')
      }
    } catch {}
  }
  if (usdt0 === 0) {
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
      usdt0 = parseInt(data.result, 16) / 1e6
    } catch {}
  }

  return { native, usdt0, address }
}
