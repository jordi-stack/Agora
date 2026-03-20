import { WdkMcpServer, WALLET_TOOLS, PRICING_TOOLS, INDEXER_TOOLS } from '@tetherto/wdk-mcp-toolkit'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import { PLASMA } from '../config/chains.js'

let mcpServer = null

export async function initMCP(seed) {
  mcpServer = new WdkMcpServer('agora', '1.0.0')
  mcpServer.useWdk({ seed })
  mcpServer.registerWallet('plasma', WalletManagerEvm, { provider: PLASMA.rpc })

  mcpServer.registerToken('plasma', 'USDT0', {
    address: PLASMA.usdt0,
    decimals: PLASMA.usdt0Decimals,
  })

  mcpServer.usePricing()

  const tools = [...WALLET_TOOLS, ...PRICING_TOOLS]
  if (process.env.WDK_INDEXER_API_KEY) {
    mcpServer.useIndexer({ apiKey: process.env.WDK_INDEXER_API_KEY })
    tools.push(...INDEXER_TOOLS)
  }
  mcpServer.registerTools(tools)

  console.log('[mcp] WDK MCP Toolkit initialized')
  console.log('[mcp] Registered: plasma chain, USDT0 token')
  console.log('[mcp] Tools:', tools.map(t => t.name).join(', '))
  return mcpServer
}

export function getMCP() { return mcpServer }

export function disposeMCP() {
  if (mcpServer) { mcpServer.close(); console.log('[mcp] MCP server closed') }
}
