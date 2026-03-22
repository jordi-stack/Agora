import { WdkMcpServer, WALLET_TOOLS, PRICING_TOOLS, INDEXER_TOOLS } from '@tetherto/wdk-mcp-toolkit'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import { CHAIN } from '../config/chains.js'

let mcpServer = null

export async function initMCP(seed) {
  mcpServer = new WdkMcpServer('agora', '1.0.0')
  mcpServer.useWdk({ seed })
  mcpServer.registerWallet('sepolia', WalletManagerEvm, { provider: CHAIN.rpc })

  mcpServer.registerToken('sepolia', 'USDT0', {
    address: CHAIN.usdt0,
    decimals: CHAIN.usdt0Decimals,
  })

  mcpServer.usePricing()

  const tools = [...WALLET_TOOLS, ...PRICING_TOOLS]
  if (process.env.WDK_INDEXER_API_KEY) {
    mcpServer.useIndexer({ apiKey: process.env.WDK_INDEXER_API_KEY })
    tools.push(...INDEXER_TOOLS)
  }
  mcpServer.registerTools(tools)

  console.log('[mcp] WDK MCP Toolkit initialized')
  console.log('[mcp] Registered: sepolia chain, USDT0 token')
  console.log('[mcp] Tools:', tools.map(t => t.name).join(', '))
  return mcpServer
}

export function getMCP() { return mcpServer }

export function disposeMCP() {
  if (mcpServer) { mcpServer.close(); console.log('[mcp] MCP server closed') }
}
