import { chat, chatWithTools, getProvider } from './llm.js'
import { getBalances } from '../mcp/wallet.js'
import { getMCP } from '../mcp/server.js'
import { store } from '../state/store.js'
import { getPrices, getRequestVolume } from '../x402/pricing.js'

const SYSTEM_PROMPT = `You are Agora, an autonomous self-sustaining AI treasury agent on Ethereum Sepolia testnet. You earn USDT0 by selling AI analysis services and manage your own treasury.

You have tools to inspect your financial state. Use them to gather information, then make a decision.

Your possible actions:
- "hold" — do nothing, wait for better conditions
- "transfer" — move surplus USDT0 from treasury to savings (specify amount)
- "reprice" — adjust service pricing based on demand (specify new price for analyze endpoint in USDT0, e.g. "0.006")

Decision rules:
- Only transfer when treasury balance exceeds 1.0 USDT0 and there is surplus above 0.5 USDT0 minimum
- Maximum single transfer: 0.1 USDT0
- Only reprice if demand pattern has clearly shifted (>20% change in request volume)
- Do not reverse a pricing decision from the previous cycle unless conditions shifted significantly

After gathering data with tools, respond with a JSON decision:
{"action":"hold|transfer|reprice","amount":"0.05","newPrice":"0.006","confidence":0.85,"reasoning":"explanation"}`

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'check_balances',
      description: 'Get USDT0 and ETH balances for treasury, savings, and demo accounts',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_revenue',
      description: 'Get recent revenue events (last 20). Each has amount, timestamp, type, endpoint.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_expenses',
      description: 'Get recent expense events (last 20). Each has amount, timestamp, type.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_pricing',
      description: 'Get current service prices and request volume per endpoint',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_decisions',
      description: 'Get last 5 agent decisions to understand recent behavior patterns',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_market_price',
      description: 'Get current price of a crypto asset (BTC, ETH, etc.) from pricing service',
      parameters: {
        type: 'object',
        properties: {
          asset: { type: 'string', description: 'Asset symbol: BTC, ETH, SOL, etc.' },
        },
        required: ['asset'],
      },
    },
  },
]

async function executeTool(name, args) {
  switch (name) {
    case 'check_balances': {
      const balances = await getBalances()
      return {
        treasury: { usdt0: balances.treasury.usdt0, eth: balances.treasury.native },
        savings: { usdt0: balances.savings.usdt0, eth: balances.savings.native },
        demoBuyer: { usdt0: balances.demoBuyer.usdt0, eth: balances.demoBuyer.native },
      }
    }
    case 'check_revenue': {
      const revenue = await store.getRevenue(20)
      const lastHour = revenue.filter(r => Date.now() - r.timestamp < 3600000)
      return {
        total: revenue.reduce((s, r) => s + (r.amount || 0), 0),
        lastHourCount: lastHour.length,
        lastHourTotal: lastHour.reduce((s, r) => s + (r.amount || 0), 0),
        recent: revenue.slice(0, 5).map(r => ({ amount: r.amount, type: r.type, ago: Math.round((Date.now() - r.timestamp) / 60000) + 'min' })),
      }
    }
    case 'check_expenses': {
      const expenses = await store.getExpenses(20)
      const lastHour = expenses.filter(e => Date.now() - e.timestamp < 3600000)
      return {
        total: expenses.reduce((s, e) => s + (e.amount || 0), 0),
        lastHourTotal: lastHour.reduce((s, e) => s + (e.amount || 0), 0),
        recent: expenses.slice(0, 5).map(e => ({ amount: e.amount, type: e.type, ago: Math.round((Date.now() - e.timestamp) / 60000) + 'min' })),
      }
    }
    case 'check_pricing': {
      const prices = getPrices()
      const volume = getRequestVolume()
      return { prices, volume }
    }
    case 'check_decisions': {
      const decisions = await store.getDecisions(5)
      return decisions.map(d => ({
        action: d.action,
        confidence: d.confidence,
        reasoning: d.reasoning,
        ago: Math.round((Date.now() - d.timestamp) / 60000) + 'min',
      }))
    }
    case 'check_market_price': {
      const mcp = getMCP()
      if (mcp?.pricingClient) {
        try {
          const price = await mcp.pricingClient.getCurrentPrice((args.asset || 'BTC').toUpperCase(), 'USD')
          return { asset: args.asset, price, source: 'MCP/Bitfinex' }
        } catch {}
      }
      return { asset: args.asset, price: null, source: 'unavailable' }
    }
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

export async function getDecision(context) {
  const userPrompt = `Current cycle state:
- Treasury: ${context.treasuryBalance} USDT0, ${context.treasuryNative?.toFixed(4) || '0'} ETH
- Savings: ${context.savingsBalance} USDT0
- Previous action: ${context.previousAction || 'none'}

Use your tools to gather more data, then make your decision. Respond with JSON only after you have checked the data you need.`

  try {
    const result = await chatWithTools(SYSTEM_PROMPT, userPrompt, TOOLS, executeTool, {
      temperature: 0.3,
      maxTokens: 1000,
      maxIterations: 6,
    })

    const decision = parseDecisionJSON(result.content)
    decision.provider = getProvider()
    decision.mcpToolsUsed = result.toolCalls.map(t => t.name)
    return decision
  } catch (err) {
    console.error('[reasoning] Tool-calling error, falling back to simple prompt:', err.message)
    return getDecisionSimple(context)
  }
}

async function getDecisionSimple(context) {
  const prompt = `Treasury: ${context.treasuryBalance} USDT0, Savings: ${context.savingsBalance} USDT0, Revenue last hour: ${context.revenueLastHour} USDT0 (${context.revenueCount} payments), Requests: ${context.requestsLastHour}, Previous: ${context.previousAction || 'none'}. Decide: hold, transfer, or reprice. JSON only.`
  try {
    const content = await chat(SYSTEM_PROMPT, prompt, { temperature: 0.3, maxTokens: 300 })
    const decision = parseDecisionJSON(content)
    decision.provider = getProvider()
    decision.fallback = true
    return decision
  } catch (err) {
    return { action: 'hold', confidence: 0, reasoning: `LLM error: ${err.message}`, provider: getProvider() }
  }
}

export function parseDecisionJSON(content) {
  try { return JSON.parse(content) } catch {}
  const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) { try { return JSON.parse(codeBlock[1].trim()) } catch {} }
  const jsonObj = content.match(/\{[\s\S]*\}/)
  if (jsonObj) { try { return JSON.parse(jsonObj[0]) } catch {} }
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
  const prompt = `Assess the risk of this Sepolia testnet wallet. Return a brief risk assessment in 2 sentences with a score 0-100 (0=safest).
Address: ${address}, Native balance: ${onChainData.balance.toFixed(4)} ETH, Transaction count: ${onChainData.txCount}`

  try {
    return await chat('You are a blockchain risk analyst. Be concise and specific.', prompt, { temperature: 0.3, maxTokens: 150 })
  } catch (err) {
    return `Risk assessment unavailable: ${err.message}`
  }
}
