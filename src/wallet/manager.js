import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import { PLASMA } from '../config/chains.js'


let manager = null
const accounts = {}
const addresses = {}

export async function initWallet(seed) {
  manager = new WalletManagerEvm(seed, { provider: PLASMA.rpc })

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
  try {
    const addr = await account.getAddress()
    const res = await fetch(PLASMA.rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'eth_call', id: 1,
        params: [{
          to: PLASMA.usdt0,
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
  const [treasuryNative, savingsNative, demoBuyerNative] = await Promise.all([
    accounts.treasury.getBalance(),
    accounts.savings.getBalance(),
    accounts.demoBuyer.getBalance(),
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
