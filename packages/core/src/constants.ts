import { plumise } from '@plumise/core'
import type { PaymentConfig } from './types'

export const PLUMISE_CHAIN = {
  chainId: plumise.id,
  chainIdHex: `0x${plumise.id.toString(16)}` as const,
  name: plumise.name,
  rpcUrl: plumise.rpcUrls.default.http[0],
  explorerUrl: plumise.blockExplorers.default.url,
  symbol: plumise.nativeCurrency.symbol,
  decimals: plumise.nativeCurrency.decimals,
} as const

export const PEXUS_CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/pexus/...'

export const ERC20_TRANSFER_ABI =
  'function transfer(address to, uint256 amount) returns (bool)'

export const DEFAULT_CONFIG: Required<PaymentConfig> = {
  theme: 'auto',
  locale: 'ko',
  chainId: PLUMISE_CHAIN.chainId,
  rpcUrl: PLUMISE_CHAIN.rpcUrl,
  chainName: PLUMISE_CHAIN.name,
  explorerUrl: PLUMISE_CHAIN.explorerUrl,
  apiUrl: '',
}

export const PAYMENT_TIMEOUT_MS = 15 * 60 * 1000
export const TX_POLL_INTERVAL_MS = 3000
export const MANUAL_POLL_INTERVAL_MS = 5000
