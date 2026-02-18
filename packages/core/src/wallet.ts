import { parsePLM } from '@plumise/core'
import type { WalletInfo } from './types'
import { PLUMISE_CHAIN, TX_POLL_INTERVAL_MS } from './constants'

interface EthereumProvider {
  isPexus?: boolean
  isMetaMask?: boolean
  isPhantom?: boolean
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
}

interface WindowWithWallets {
  pexus?: { ethereum?: EthereumProvider }
  plumise?: { ethereum?: EthereumProvider }
  ethereum?: EthereumProvider
  phantom?: { ethereum?: EthereumProvider }
}

/**
 * Pexus 전용 프로바이더를 우선 탐색.
 * 우선순위: window.pexus.ethereum > window.plumise.ethereum > window.ethereum(isPexus) > window.ethereum
 */
function getProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as WindowWithWallets

  // 1. Pexus 전용 네임스페이스 우선
  if (w.pexus?.ethereum) return w.pexus.ethereum
  if (w.plumise?.ethereum) return w.plumise.ethereum

  // 2. window.ethereum에서 isPexus 플래그 확인
  if (w.ethereum?.isPexus) return w.ethereum

  // 3. 일반 window.ethereum 폴백
  return w.ethereum ?? null
}

/** Pexus를 우선하지 않고 모든 프로바이더를 있는 그대로 감지 */
function getAnyProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as WindowWithWallets).ethereum ?? null
}

export function detectWallet(): WalletInfo {
  if (typeof window === 'undefined') return { type: 'none' }
  const w = window as unknown as WindowWithWallets

  // Pexus 전용 네임스페이스가 있으면 무조건 pexus
  if (w.pexus?.ethereum || w.plumise?.ethereum) {
    return { type: 'pexus' }
  }

  // window.ethereum 확인
  const provider = w.ethereum
  if (!provider) return { type: 'none' }

  if (provider.isPexus) return { type: 'pexus' }
  if (provider.isMetaMask) return { type: 'metamask' }
  return { type: 'other' }
}

export async function connectWallet(): Promise<string> {
  const provider = getProvider()
  if (!provider) throw new Error('No wallet provider found')

  const accounts = (await provider.request({
    method: 'eth_requestAccounts',
  })) as string[]

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned')
  }
  return accounts[0]
}

export async function getChainId(): Promise<number> {
  const provider = getProvider()
  if (!provider) throw new Error('No wallet provider found')

  const chainIdHex = (await provider.request({ method: 'eth_chainId' })) as string
  return parseInt(chainIdHex, 16)
}

export interface ChainConfig {
  chainId: number
  name?: string
  rpcUrl?: string
  explorerUrl?: string
  symbol?: string
  decimals?: number
}

export async function switchToPlumise(chain?: ChainConfig): Promise<void> {
  const provider = getProvider()
  if (!provider) throw new Error('No wallet provider found')

  const chainId = chain?.chainId ?? PLUMISE_CHAIN.chainId
  const chainIdHex = `0x${chainId.toString(16)}`

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (err: unknown) {
    const error = err as { code?: number }
    if (error.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName: chain?.name ?? PLUMISE_CHAIN.name,
            rpcUrls: [chain?.rpcUrl ?? PLUMISE_CHAIN.rpcUrl],
            blockExplorerUrls: [chain?.explorerUrl ?? PLUMISE_CHAIN.explorerUrl],
            nativeCurrency: {
              name: chain?.symbol ?? PLUMISE_CHAIN.symbol,
              symbol: chain?.symbol ?? PLUMISE_CHAIN.symbol,
              decimals: chain?.decimals ?? PLUMISE_CHAIN.decimals,
            },
          },
        ],
      })
    } else {
      throw err
    }
  }
}

function toHexWei(amount: string): string {
  const wei = parsePLM(amount)
  return `0x${wei.toString(16)}`
}

function encodeERC20Transfer(to: string, amountWei: bigint): string {
  const selector = '0xa9059cbb'
  const paddedTo = to.replace('0x', '').padStart(64, '0')
  const paddedAmount = amountWei.toString(16).padStart(64, '0')
  return `${selector}${paddedTo}${paddedAmount}`
}

export async function sendTransaction(
  to: string,
  amount: string,
  from: string,
  data?: string,
): Promise<string> {
  const provider = getProvider()
  if (!provider) throw new Error('No wallet provider found')

  const txHash = (await provider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from,
        to,
        value: toHexWei(amount),
        ...(data ? { data } : {}),
      },
    ],
  })) as string

  return txHash
}

export async function sendERC20(
  tokenAddress: string,
  to: string,
  amount: string,
  from: string,
): Promise<string> {
  const provider = getProvider()
  if (!provider) throw new Error('No wallet provider found')

  const amountWei = parsePLM(amount)
  const data = encodeERC20Transfer(to, amountWei)

  const txHash = (await provider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from,
        to: tokenAddress,
        value: '0x0',
        data,
      },
    ],
  })) as string

  return txHash
}

interface TransactionReceipt {
  blockNumber: string
  status: string
}

export async function waitForConfirmation(
  txHash: string,
  rpcUrl: string,
  timeout = 60_000,
): Promise<{ blockNumber: number }> {
  const deadline = Date.now() + timeout

  while (Date.now() < deadline) {
    try {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        }),
      })
      const json = (await res.json()) as { result: TransactionReceipt | null }
      if (json.result) {
        if (json.result.status === '0x0') {
          throw new Error('Transaction reverted')
        }
        return { blockNumber: parseInt(json.result.blockNumber, 16) }
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Transaction reverted') {
        throw err
      }
    }
    await sleep(TX_POLL_INTERVAL_MS)
  }

  throw new Error('Confirmation timeout')
}

interface JsonRpcBlock {
  transactions: Array<{ from: string; to: string | null; value: string; hash: string }>
}

export async function pollForPayment(
  to: string,
  expectedAmountWei: bigint,
  rpcUrl: string,
  onDetected: (txHash: string) => void,
  signal: AbortSignal,
): Promise<string> {
  const normalizedTo = to.toLowerCase()
  let lastBlock = await getLatestBlockNumber(rpcUrl)

  return new Promise<string>((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')))

    const poll = async () => {
      if (signal.aborted) return

      try {
        const current = await getLatestBlockNumber(rpcUrl)
        if (current > lastBlock) {
          for (let i = lastBlock + 1; i <= current; i++) {
            const txHash = await checkBlockForPayment(i, normalizedTo, expectedAmountWei, rpcUrl)
            if (txHash) {
              onDetected(txHash)
              resolve(txHash)
              return
            }
          }
          lastBlock = current
        }
      } catch {
        // 무시하고 계속 폴링
      }

      if (!signal.aborted) {
        setTimeout(poll, 5000)
      }
    }

    poll()
  })
}

async function getLatestBlockNumber(rpcUrl: string): Promise<number> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_blockNumber',
      params: [],
    }),
  })
  const json = (await res.json()) as { result: string }
  return parseInt(json.result, 16)
}

async function checkBlockForPayment(
  blockNumber: number,
  to: string,
  expectedAmountWei: bigint,
  rpcUrl: string,
): Promise<string | null> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBlockByNumber',
      params: [`0x${blockNumber.toString(16)}`, true],
    }),
  })
  const json = (await res.json()) as { result: JsonRpcBlock | null }
  if (!json.result) return null

  for (const tx of json.result.transactions) {
    if (
      tx.to?.toLowerCase() === to &&
      BigInt(tx.value) >= expectedAmountWei
    ) {
      return tx.hash
    }
  }
  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
