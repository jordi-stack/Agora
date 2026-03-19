export const PLASMA = {
  name: 'plasma',
  chainId: 9745,
  network: 'eip155:9745',
  rpc: process.env.PLASMA_RPC || 'https://rpc.plasma.to',
  usdt0: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
  usdt0Decimals: 6,
  explorer: 'https://plasmascan.to',
  explorerTx: (hash) => `https://plasmascan.to/tx/${hash}`,
  explorerAddress: (addr) => `https://plasmascan.to/address/${addr}`,
}
