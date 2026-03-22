export const SAFETY = {
  minOperatingBalance: 0.5,
  maxSingleTx: 0.1,
  spendingRateLimit: 5.0,
  emergencyDropThreshold: 0.5,
}

export function checkSafety(balance, spentLastHour, balanceOneHourAgo) {
  const rules = []

  rules.push({
    name: 'minBalance',
    label: 'Minimum Balance',
    status: balance >= SAFETY.minOperatingBalance ? 'green' : 'red',
    value: balance,
    threshold: SAFETY.minOperatingBalance,
  })

  rules.push({
    name: 'spendingRate',
    label: 'Spending Rate',
    status: spentLastHour <= SAFETY.spendingRateLimit ? 'green' :
            spentLastHour <= SAFETY.spendingRateLimit * 1.5 ? 'yellow' : 'red',
    value: spentLastHour,
    threshold: SAFETY.spendingRateLimit,
  })

  const drop = balanceOneHourAgo > 0 ? (balanceOneHourAgo - balance) / balanceOneHourAgo : 0
  rules.push({
    name: 'emergencyDrop',
    label: 'Balance Stability',
    status: drop < SAFETY.emergencyDropThreshold ? 'green' : 'red',
    value: Math.round(drop * 100),
    threshold: Math.round(SAFETY.emergencyDropThreshold * 100),
  })

  const paused = rules.some(r => r.status === 'red')
  return {
    rules,
    paused,
    overall: paused ? 'red' : rules.some(r => r.status === 'yellow') ? 'yellow' : 'green',
  }
}
