export const CHAIN = {
  name: 'sepolia',
  chainId: 11155111,
  network: 'eip155:11155111',
  rpc: process.env.CHAIN_RPC || 'https://sepolia.drpc.org',
  usdt0: '0xd077a400968890eacc75cdc901f0356c943e4fdb',
  usdt0Decimals: 6,
  explorer: 'https://sepolia.etherscan.io',
  explorerTx: (hash) => `https://sepolia.etherscan.io/tx/${hash}`,
  explorerAddress: (addr) => `https://sepolia.etherscan.io/address/${addr}`,
}
