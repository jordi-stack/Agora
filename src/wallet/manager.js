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

export async function getBalances() {
  const [treasuryNative, savingsNative, demoBuyerNative] = await Promise.all([
    accounts.treasury.getBalance(),
    accounts.savings.getBalance(),
    accounts.demoBuyer.getBalance(),
  ])

  return {
    treasury: {
      native: Number(treasuryNative) / 1e18,
      address: addresses.treasury,
    },
    savings: {
      native: Number(savingsNative) / 1e18,
      address: addresses.savings,
    },
    demoBuyer: {
      native: Number(demoBuyerNative) / 1e18,
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
