export interface PaymentConfig {
  theme?: 'light' | 'dark' | 'auto'
  locale?: 'ko' | 'en'
  chainId?: number
  rpcUrl?: string
  chainName?: string
  explorerUrl?: string
  apiUrl?: string
}

export interface BackendPaymentInfo {
  id: string
  amount: string
  currency: string
  recipientAddress: string
  status: string
  description?: string
  orderId?: string
  expiresAt: string
}

export interface PaymentRequest {
  to: string
  amount: string
  token?: string
  orderId?: string
  description?: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  status: 'confirmed' | 'cancelled' | 'expired' | 'error'
  txHash?: string
  blockNumber?: number
  error?: string
}

export type PaymentStatus =
  | 'idle'
  | 'connecting'
  | 'awaiting_approval'
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'expired'
  | 'error'

export interface WalletInfo {
  type: 'pexus' | 'metamask' | 'other' | 'none'
  address?: string
  chainId?: number
}

export type PaymentEventType =
  | 'status_change'
  | 'wallet_detected'
  | 'tx_submitted'
  | 'tx_confirmed'
  | 'error'

export interface PaymentEvent {
  type: PaymentEventType
  data: unknown
}
