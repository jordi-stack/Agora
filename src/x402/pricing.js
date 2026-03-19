const BASE_PRICES = {
  analyze: 5000,  // $0.005 in 6-decimal USDT0
  risk: 3000,     // $0.003
}

const state = {
  analyze: { current: BASE_PRICES.analyze, requestsLastHour: 0, lastAdjustment: Date.now() },
  risk: { current: BASE_PRICES.risk, requestsLastHour: 0, lastAdjustment: Date.now() },
  history: [],
}

export function getPrice(endpoint) {
  return state[endpoint]?.current || BASE_PRICES[endpoint] || 5000
}

export function getPriceHuman(endpoint) {
  return getPrice(endpoint) / 1e6
}

export function recordRequest(endpoint) {
  if (state[endpoint]) state[endpoint].requestsLastHour++
}

export function adjustPrices(multiplier, reasoning) {
  const clamped = Math.max(0.5, Math.min(3.0, multiplier))
  for (const ep of ['analyze', 'risk']) {
    state[ep].current = Math.round(BASE_PRICES[ep] * clamped)
    state[ep].lastAdjustment = Date.now()
  }
  state.history.push({
    timestamp: Date.now(),
    multiplier: clamped,
    reasoning,
    prices: { analyze: state.analyze.current, risk: state.risk.current },
  })
}

export function getPrices() {
  return {
    analyze: { current: state.analyze.current, base: BASE_PRICES.analyze, humanPrice: state.analyze.current / 1e6, requests: state.analyze.requestsLastHour },
    risk: { current: state.risk.current, base: BASE_PRICES.risk, humanPrice: state.risk.current / 1e6, requests: state.risk.requestsLastHour },
  }
}

export function getRequestVolume() {
  return {
    analyze: state.analyze.requestsLastHour,
    risk: state.risk.requestsLastHour,
    total: state.analyze.requestsLastHour + state.risk.requestsLastHour,
  }
}

export function resetHourlyCounters() {
  state.analyze.requestsLastHour = 0
  state.risk.requestsLastHour = 0
}

export function getPriceHistory() {
  return state.history.slice(-50)
}
