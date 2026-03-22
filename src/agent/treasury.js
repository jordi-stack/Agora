import { SAFETY } from '../config/safety.js'
import { transferUSDT0 } from '../wallet/tx-pipeline.js'
import { getMCP } from '../mcp/server.js'
import { getAccount as getAccountFallback } from '../wallet/manager.js'
import { store } from '../state/store.js'

const PROFIT_THRESHOLD = 1.0

export async function evaluateTreasury(treasuryBalance, savingsAddress) {
  const surplus = treasuryBalance - SAFETY.minOperatingBalance

  if (treasuryBalance <= PROFIT_THRESHOLD || surplus <= 0) {
    return { transferred: false, reason: `Treasury ${treasuryBalance.toFixed(4)} below threshold ${PROFIT_THRESHOLD}` }
  }

  const transferAmount = Math.min(surplus * 0.5, SAFETY.maxSingleTx)
  const rounded = Math.round(transferAmount * 1e6) / 1e6

  if (rounded <= 0) {
    return { transferred: false, reason: 'Transfer amount too small' }
  }

  try {
    const mcp = getMCP()
    const account = mcp
      ? await mcp.wdk.getAccount('sepolia', 0)
      : getAccountFallback('treasury')
    const receipt = await transferUSDT0(
      account,
      savingsAddress,
      rounded,
      'Autonomous profit transfer to savings'
    )

    await store.addTx(receipt)
    await store.addExpense({
      timestamp: Date.now(),
      type: 'profit_transfer',
      amount: rounded,
      txHash: receipt.hash,
      explorer: receipt.explorer,
    })

    return { transferred: true, amount: rounded, receipt }
  } catch (err) {
    console.error('[treasury] Transfer failed:', err.message)
    return { transferred: false, reason: err.message }
  }
}

export function calculatePnL(revenue, expenses) {
  const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  return {
    revenue: Math.round(totalRevenue * 1e6) / 1e6,
    expenses: Math.round(totalExpenses * 1e6) / 1e6,
    profit: Math.round((totalRevenue - totalExpenses) * 1e6) / 1e6,
  }
}
