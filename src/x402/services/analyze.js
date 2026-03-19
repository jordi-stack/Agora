import { analyzeMarket } from '../../agent/reasoning.js'
import { getProvider } from '../../agent/llm.js'

export async function handleAnalyze(req, res) {
  try {
    const asset = req.body?.asset || 'BTC'
    const pair = `t${asset.toUpperCase()}USD`

    // Fetch real price data from Bitfinex
    let priceData = null
    let analysis = ''

    try {
      const tickerRes = await fetch(`https://api-pub.bitfinex.com/v2/ticker/${pair}`, { signal: AbortSignal.timeout(5000) })
      const ticker = await tickerRes.json()

      if (Array.isArray(ticker) && ticker.length >= 10) {
        priceData = {
          bid: ticker[0], ask: ticker[2], lastPrice: ticker[6],
          volume: ticker[7], high: ticker[8], low: ticker[9],
          change: ticker[4], changePercent: ticker[5],
        }
        analysis = await analyzeMarket(asset, priceData)
      }
    } catch (fetchErr) {
      // Bitfinex unavailable — provide LLM-only analysis
      analysis = await analyzeMarket(asset, { lastPrice: 'N/A', changePercent: 0, high: 'N/A', low: 'N/A', volume: 'N/A' })
    }

    res.json({
      asset,
      timestamp: Date.now(),
      price: priceData,
      analysis,
      confidence: 0.80,
      source: 'agora-agent',
      poweredBy: `Bitfinex + ${getProvider()}`,
    })
  } catch (err) {
    res.status(500).json({ error: err.message, source: 'agora-agent' })
  }
}
