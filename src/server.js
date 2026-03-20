import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initWallet, dispose } from './wallet/manager.js'
import { initMCP, disposeMCP } from './mcp/server.js'
import { initLLM } from './agent/llm.js'
import { setupX402 } from './x402/middleware.js'
import { handleAnalyze } from './x402/services/analyze.js'
import { handleRisk } from './x402/services/risk.js'
import { initStore } from './state/store.js'
import { startLoop, stopLoop } from './agent/loop.js'
import routes from './api/routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4747
const HOST = process.env.HOST || '0.0.0.0'

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║  AGORA — Self-Sustaining AI Agent        ║')
  console.log('║  Earning USDT0 via x402 on Plasma        ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log()

  // 1. Init state store
  initStore()

  // 2. Init LLM provider
  await initLLM()

  // 3. Init WDK wallet (3 accounts)
  const { accounts, addresses } = await initWallet(process.env.WDK_SEED)

  // 3b. Init MCP Toolkit (agent reasoning layer)
  try {
    await initMCP(process.env.WDK_SEED)
  } catch (err) {
    console.warn('[mcp] MCP Toolkit init failed:', err.message)
    console.warn('[mcp] Agent loop will use direct WDK calls')
  }

  // 4. Setup Express
  const app = express()
  app.use(cors())
  app.use(express.json())

  // 5. Setup x402 payment middleware (BEFORE route handlers)
  try {
    setupX402(app, addresses.treasury)
  } catch (err) {
    console.warn('[x402] Setup failed:', err.message)
    console.warn('[x402] Running without payment gate — endpoints are free')
  }

  // 6. Paid service routes (behind x402 paywall)
  app.post('/api/analyze', handleAnalyze)
  app.post('/api/risk', handleRisk)

  // 7. Dashboard API routes (free)
  app.use(routes)

  // 8. Serve SKILL.md for OpenClaw discovery
  app.get('/SKILL.md', (req, res) => {
    res.type('text/plain').sendFile(path.join(__dirname, '..', 'SKILL.md'))
  })

  // 9. Serve React dashboard
  const clientDist = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/')) {
      const indexPath = path.join(clientDist, 'index.html')
      res.sendFile(indexPath, (err) => {
        if (err) res.json({ agent: 'agora', status: 'Dashboard not built yet. Run: cd client && npm run build' })
      })
    } else {
      next()
    }
  })

  // 9. Start server
  const server = app.listen(PORT, HOST, () => {
    console.log()
    console.log(`✅ Agora Agent running on port ${PORT}`)
    console.log(`📊 Dashboard: http://localhost:${PORT}`)
    console.log(`💰 x402 endpoints:`)
    console.log(`   POST /api/analyze (market analysis)`)
    console.log(`   POST /api/risk    (wallet risk scoring)`)
    console.log(`🤖 Demo buyer: POST /api/demo-buy`)
    console.log()
  })

  // 10. Start autonomous agent loop
  startLoop(addresses.savings)

  // 11. Graceful shutdown
  const shutdown = () => {
    console.log('\n🛑 Shutting down Agora Agent...')
    stopLoop()
    disposeMCP()
    dispose()
    server.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch(err => {
  console.error('💀 Fatal error:', err)
  process.exit(1)
})
