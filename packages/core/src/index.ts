export { PlumisePay } from './plumise-pay'

export type {
  PaymentConfig,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  WalletInfo,
  PaymentEventType,
  PaymentEvent,
  BackendPaymentInfo,
} from './types'

export {
  PLUMISE_CHAIN,
  DEFAULT_CONFIG,
  PAYMENT_TIMEOUT_MS,
  TX_POLL_INTERVAL_MS,
  PEXUS_CHROME_STORE_URL,
  ERC20_TRANSFER_ABI,
} from './constants'

export { detectWallet, connectWallet, getChainId, switchToPlumise } from './wallet'

export { t } from './i18n'
export type { Locale, MessageKey } from './i18n'
