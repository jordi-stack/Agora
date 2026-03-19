const BASE_URL = 'https://wdk-api.tether.io/api/v1'

export function isIndexerEnabled() {
  return !!process.env.WDK_INDEXER_API_KEY
}

async function indexerFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-api-key': process.env.WDK_INDEXER_API_KEY },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Indexer ${res.status}`)
  return res.json()
}

export async function getTokenBalance(blockchain, token, address) {
  try {
    const data = await indexerFetch(`/${blockchain}/${token}/${address}/token-balances`)
    return data.tokenBalance
  } catch {
    return null
  }
}

export async function getTokenTransfers(blockchain, token, address, limit = 20) {
  try {
    const data = await indexerFetch(`/${blockchain}/${token}/${address}/token-transfers?limit=${limit}`)
    return data.transfers || []
  } catch {
    return []
  }
}
