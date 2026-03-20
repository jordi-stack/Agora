import { getBalances, getRecentToolCalls } from '../mcp/wallet.js'
import { getDecision } from './reasoning.js'
import { evaluateTreasury, calculatePnL } from './treasury.js'
import { getPrices, adjustPrices, getRequestVolume, resetHourlyCounters } from '../x402/pricing.js'
import { checkSafety, SAFETY } from '../config/safety.js'
import { store } from '../state/store.js'

const LOOP_INTERVAL = 5 * 60 * 1000
let loopHandle = null
let previousAction = null
let cycleCount = 0

export function startLoop(savingsAddress) {
  console.log('[agent] Autonomous loop starting (every 5 min)')

  loopHandle = setInterval(() => runCycle(savingsAddress), LOOP_INTERVAL)

  // First cycle after 30s
  setTimeout(() => runCycle(savingsAddress), 30_000)
}

export function stopLoop() {
  if (loopHandle) clearInterval(loopHandle)
  console.log('[agent] Loop stopped')
}

async function runCycle(savingsAddress) {
  cycleCount++
  console.log(`\n[agent] ═══ Cycle #${cycleCount} ═══`)

  try {
    const balances = await getBalances()
    const treasuryBalance = balances.treasury.usdt0 || 0
    const savingsBalance = balances.savings.usdt0 || 0
    console.log(`[agent] Treasury: ${treasuryBalance} USDT0 (${balances.treasury.native.toFixed(4)} XPL) | Savings: ${savingsBalance} USDT0`)

    const revenue = await store.getRevenue(100)
    const expenses = await store.getExpenses(100)
    const pnl = calculatePnL(revenue, expenses)
    const volume = getRequestVolume()
    const prices = getPrices()

    const recentExpenses = expenses
      .filter(e => Date.now() - e.timestamp < 3600000)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
    const recentRevenue = revenue
      .filter(r => Date.now() - r.timestamp < 3600000)
      .reduce((sum, r) => sum + (r.amount || 0), 0)
    const balanceOneHourAgo = treasuryBalance - recentRevenue + recentExpenses
    const safety = checkSafety(treasuryBalance, recentExpenses, balanceOneHourAgo)

    if (safety.paused) {
      const decision = { timestamp: Date.now(), action: 'paused', confidence: 1, reasoning: 'Safety rules violated — agent paused', cycle: cycleCount }
      await store.addDecision(decision)
      console.log('[agent] ⚠️ PAUSED — safety rules violated')
      await updateTreasuryState(balances, pnl, prices, safety, volume)
      return
    }

    const revenueLastHour = revenue
      .filter(r => Date.now() - r.timestamp < 3600000)
      .reduce((sum, r) => sum + (r.amount || 0), 0)
    const revenueCount = revenue.filter(r => Date.now() - r.timestamp < 3600000).length

    const decision = await getDecision({
      treasuryBalance,
      treasuryXPL: balances.treasury.native,
      savingsBalance,
      revenueLastHour,
      revenueCount,
      requestsLastHour: volume.total,
      prices: { analyze: prices.analyze.current, risk: prices.risk.current },
      minBalance: SAFETY.minOperatingBalance,
      previousAction: previousAction || 'none',
    })

    console.log(`[agent] Decision: ${decision.action} (confidence: ${decision.confidence})`)
    console.log(`[agent] Reasoning: ${decision.reasoning}`)

    if (decision.confidence >= 0.7) {
      if (decision.action === 'transfer') {
        const result = await evaluateTreasury(treasuryBalance, savingsAddress)
        decision.executionResult = result
        if (result.transferred) console.log(`[agent] 💰 Transferred ${result.amount} USDT0 to savings`)
      } else if (decision.action === 'reprice' && decision.newPrice) {
        const newPriceFloat = parseFloat(decision.newPrice)
        if (newPriceFloat > 0) {
          const multiplier = newPriceFloat / 0.005
          adjustPrices(multiplier, decision.reasoning)
          decision.executionResult = { repriced: true, newPrice: newPriceFloat }
          console.log(`[agent] 📊 Repriced to $${newPriceFloat}`)
        }
      }
      previousAction = decision.action
    } else {
      decision.executionResult = { skipped: true, reason: 'confidence below 0.7' }
    }

    decision.mcpTools = getRecentToolCalls()
    await store.addDecision({ ...decision, timestamp: Date.now(), cycle: cycleCount })
    await updateTreasuryState(balances, pnl, prices, safety, volume)

    if (cycleCount % 12 === 0) resetHourlyCounters()

  } catch (err) {
    console.error('[agent] Cycle error:', err.message)
    await store.addDecision({
      timestamp: Date.now(), action: 'error', confidence: 0,
      reasoning: `Cycle error: ${err.message}`, cycle: cycleCount,
    })
  }
}

async function updateTreasuryState(balances, pnl, prices, safety, volume) {
  await store.setTreasury({
    treasury: balances.treasury,
    savings: balances.savings,
    pnl,
    pricing: prices,
    safety,
    volume,
    lastCycle: Date.now(),
    cycleCount,
  })
}
