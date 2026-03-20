import { analyzeMarket } from '../../agent/reasoning.js'
import { getProvider } from '../../agent/llm.js'
import { getMCP } from '../../mcp/server.js'

async function fetchPriceViaMCP(asset) {
  const mcp = getMCP()
  if (!mcp?.pricingClient) return null

  try {
    const price = await mcp.pricingClient.getCurrentPrice(asset.toUpperCase(), 'USD')
    if (price != null) {
      return {
        lastPrice: price, high: 'N/A', low: 'N/A',
        volume: 'N/A', change: 0, changePercent: 0,
        source: 'MCP/Bitfinex',
      }
    }
  } catch {}
  return null
}

async function fetchPriceDirect(asset) {
  // Bitfinex
  try {
    const pair = `t${asset.toUpperCase()}USD`
    const res = await fetch(`https://api-pub.bitfinex.com/v2/ticker/${pair}`, { signal: AbortSignal.timeout(5000) })
    const ticker = await res.json()
    if (Array.isArray(ticker) && ticker.length >= 10) {
      return {
        lastPrice: ticker[6], high: ticker[8], low: ticker[9],
        volume: ticker[7], change: ticker[4], changePercent: ticker[5],
        source: 'Bitfinex',
      }
    }
  } catch {}

  // CoinGecko fallback
  try {
    const id = { BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', USDT: 'tether' }[asset.toUpperCase()] || asset.toLowerCase()
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`, { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    if (data[id]) {
      return {
        lastPrice: data[id].usd, high: 'N/A', low: 'N/A',
        volume: 'N/A', change: 0, changePercent: (data[id].usd_24h_change || 0) / 100,
        source: 'CoinGecko',
      }
    }
  } catch {}

  return null
}

async function fetchPrice(asset) {
  // Try direct Bitfinex/CoinGecko first (full data: high, low, volume, change)
  const directPrice = await fetchPriceDirect(asset)
  if (directPrice) return directPrice

  // Fallback to MCP pricing tool (lastPrice only)
  return fetchPriceViaMCP(asset)
}

export async function handleAnalyze(req, res) {
  try {
    const asset = req.body?.asset || 'BTC'

    const priceData = await fetchPrice(asset)
    const analysisInput = priceData || { lastPrice: 'N/A', changePercent: 0, high: 'N/A', low: 'N/A', volume: 'N/A' }
    const analysis = await analyzeMarket(asset, analysisInput)

    res.json({
      asset,
      timestamp: Date.now(),
      price: priceData,
      analysis,
      confidence: priceData ? 0.85 : 0.60,
      source: 'agora-agent',
      poweredBy: `${priceData?.source || 'LLM-only'} + ${getProvider()}`,
    })
  } catch (err) {
    res.status(500).json({ error: err.message, source: 'agora-agent' })
  }
}
