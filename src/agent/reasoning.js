import { chat, getProvider } from './llm.js'

const SYSTEM_PROMPT = `You are Agora, an autonomous self-sustaining AI treasury agent on the Plasma blockchain. You earn USDT0 by selling AI analysis services via x402 micropayments and manage your own treasury autonomously.

Analyze the provided data and return a JSON decision. Consider:
- Revenue trends (increasing/decreasing/stable)
- Current balance vs safety thresholds (min operating: 0.5 USDT0)
- Pricing demand (request volume per hour)
- Avoid thrashing — do not reverse a pricing decision from the previous cycle unless conditions shifted >20%

Respond ONLY with valid JSON:
{"action":"hold|transfer|reprice","amount":"0.05","newPrice":"0.006","confidence":0.85,"reasoning":"Revenue up 30% in last hour, demand justifies price increase"}`

export async function getDecision(context) {
  const userPrompt = `MCP Tool Results:
- getTokenBalance(treasury): ${context.treasuryBalance} USDT0
- getBalance(treasury): ${context.treasuryXPL?.toFixed(4) || '0'} XPL
- getTokenBalance(savings): ${context.savingsBalance} USDT0

Agent State:
- Revenue last hour: ${context.revenueLastHour} USDT0 (${context.revenueCount} payments)
- Requests last hour: ${context.requestsLastHour}
- Current prices: analyze=$${(context.prices.analyze / 1e6).toFixed(4)}, risk=$${(context.prices.risk / 1e6).toFixed(4)}
- Min operating balance: ${context.minBalance} USDT0
- Profit threshold for transfer: 1.0 USDT0
- Previous action: ${context.previousAction || 'none'}

What should I do? Return JSON only.`

  try {
    const content = await chat(SYSTEM_PROMPT, userPrompt, { temperature: 0.3, maxTokens: 300 })
    const decision = parseDecisionJSON(content)
    decision.provider = getProvider()
    return decision
  } catch (err) {
    console.error('[reasoning] LLM error:', err.message)
    return { action: 'hold', confidence: 0, reasoning: `LLM error: ${err.message}`, provider: getProvider() }
  }
}

function parseDecisionJSON(content) {
  // Direct parse
  try { return JSON.parse(content) } catch {}

  // Extract from markdown code block
  const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1].trim()) } catch {}
  }

  // Extract any JSON object
  const jsonObj = content.match(/\{[\s\S]*\}/)
  if (jsonObj) {
    try { return JSON.parse(jsonObj[0]) } catch {}
  }

  console.warn('[reasoning] Failed to parse LLM response:', content.substring(0, 200))
  return { action: 'hold', confidence: 0, reasoning: 'LLM parse error: ' + content.substring(0, 100) }
}

export async function analyzeMarket(asset, priceData) {
  const prompt = `Analyze this ${asset}/USD market data and provide a brief, actionable insight in 2-3 sentences:
Price: $${priceData.lastPrice}, 24h Change: ${(Number(priceData.changePercent) * 100 || 0).toFixed(2)}%, High: $${priceData.high}, Low: $${priceData.low}, Volume: ${typeof priceData.volume === 'number' ? priceData.volume.toFixed(0) : 'N/A'}`

  try {
    return await chat('You are a concise crypto market analyst. Provide brief, actionable insights.', prompt, { temperature: 0.4, maxTokens: 200 })
  } catch (err) {
    return `Market analysis temporarily unavailable: ${err.message}`
  }
}

export async function assessRisk(address, onChainData) {
  const prompt = `Assess the risk of this Plasma chain wallet. Return a brief risk assessment in 2 sentences with a score 0-100 (0=safest).
Address: ${address}, Native balance: ${onChainData.balance.toFixed(4)} XPL, Transaction count: ${onChainData.txCount}`

  try {
    return await chat('You are a blockchain risk analyst. Be concise and specific.', prompt, { temperature: 0.3, maxTokens: 150 })
  } catch (err) {
    return `Risk assessment unavailable: ${err.message}`
  }
}
