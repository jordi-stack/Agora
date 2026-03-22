import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import { CHAIN } from '../config/chains.js'


let manager = null
const accounts = {}
const addresses = {}

export async function initWallet(seed) {
  manager = new WalletManagerEvm(seed, { provider: CHAIN.rpc })

  accounts.treasury = await manager.getAccount(0)
  accounts.savings = await manager.getAccount(1)
  accounts.demoBuyer = await manager.getAccount(2)

  addresses.treasury = await accounts.treasury.getAddress()
  addresses.savings = await accounts.savings.getAddress()
  addresses.demoBuyer = await accounts.demoBuyer.getAddress()

  console.log('[wallet] Treasury:   ', addresses.treasury)
  console.log('[wallet] Savings:    ', addresses.savings)
  console.log('[wallet] Demo Buyer: ', addresses.demoBuyer)

  return { accounts, addresses }
}

export function getAccount(name) {
  if (!accounts[name]) throw new Error(`Account "${name}" not initialized`)
  return accounts[name]
}

export function getAddresses() {
  return { ...addresses }
}

async function getUSDT0Balance(account) {
  const addr = await account.getAddress()

  // Try WDK Indexer API first (official Tether API)
  if (process.env.WDK_INDEXER_API_KEY) {
    try {
      const res = await fetch(`https://wdk-api.tether.io/api/v1/sepolia/usdt/${addr}/token-balances`, {
        headers: { 'x-api-key': process.env.WDK_INDEXER_API_KEY },
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const data = await res.json()
        const bal = parseFloat(data.tokenBalance?.amount || '0')
        if (bal > 0) return bal
        // Indexer returned 0 — may track a different token contract, fall through to RPC
      }
    } catch {}
  }

  // Fallback: raw RPC call
  try {
    const res = await fetch(CHAIN.rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'eth_call', id: 1,
        params: [{
          to: CHAIN.usdt0,
          data: '0x70a08231000000000000000000000000' + addr.slice(2).toLowerCase(),
        }, 'latest'],
      }),
    })
    const data = await res.json()
    return parseInt(data.result, 16) / 1e6
  } catch {
    return 0
  }
}

export async function getBalances() {
  const safeGetBalance = async (account) => {
    try { return await account.getBalance() } catch { return BigInt(0) }
  }

  const [treasuryNative, savingsNative, demoBuyerNative] = await Promise.all([
    safeGetBalance(accounts.treasury),
    safeGetBalance(accounts.savings),
    safeGetBalance(accounts.demoBuyer),
  ])

  const [treasuryUSDT, savingsUSDT, demoBuyerUSDT] = await Promise.all([
    getUSDT0Balance(accounts.treasury),
    getUSDT0Balance(accounts.savings),
    getUSDT0Balance(accounts.demoBuyer),
  ])

  return {
    treasury: {
      native: Number(treasuryNative) / 1e18,
      usdt0: treasuryUSDT,
      address: addresses.treasury,
    },
    savings: {
      native: Number(savingsNative) / 1e18,
      usdt0: savingsUSDT,
      address: addresses.savings,
    },
    demoBuyer: {
      native: Number(demoBuyerNative) / 1e18,
      usdt0: demoBuyerUSDT,
      address: addresses.demoBuyer,
    },
  }
}

export function dispose() {
  if (manager && typeof manager.dispose === 'function') {
    manager.dispose()
    console.log('[wallet] Keys wiped from memory')
  }
}
