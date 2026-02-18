let requestId = 0

async function rpcCall(url: string, method: string, params: unknown[]): Promise<unknown> {
  const id = ++requestId
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  })

  if (!response.ok) {
    throw new Error(`RPC HTTP error: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as { result?: unknown; error?: { message: string; code: number } }

  if (json.error) {
    throw new Error(`RPC error [${json.error.code}]: ${json.error.message}`)
  }

  return json.result
}

async function getTransactionReceipt(url: string, txHash: string): Promise<unknown> {
  return rpcCall(url, 'eth_getTransactionReceipt', [txHash])
}

async function getTransaction(url: string, txHash: string): Promise<unknown> {
  return rpcCall(url, 'eth_getTransactionByHash', [txHash])
}

async function getBlockByNumber(url: string, blockNumber: string): Promise<unknown> {
  return rpcCall(url, 'eth_getBlockByNumber', [blockNumber, false])
}

async function getBalance(url: string, address: string): Promise<string> {
  const result = await rpcCall(url, 'eth_getBalance', [address, 'latest'])
  return result as string
}

async function getChainId(url: string): Promise<number> {
  const result = await rpcCall(url, 'eth_chainId', [])
  return parseInt(result as string, 16)
}

export {
  rpcCall,
  getTransactionReceipt,
  getTransaction,
  getBlockByNumber,
  getBalance,
  getChainId,
}
