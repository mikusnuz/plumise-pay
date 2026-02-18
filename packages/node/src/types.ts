export interface PlumisePayServerConfig {
  rpcUrl?: string
  chainId?: number
  webhookSecret?: string
}

export interface TransactionInfo {
  hash: string
  from: string
  to: string
  value: string
  blockNumber: number
  blockHash: string
  status: 'success' | 'reverted'
  timestamp?: number
}

export interface PaymentVerification {
  valid: boolean
  tx?: TransactionInfo
  error?: string
  amountMatch?: boolean
  recipientMatch?: boolean
  chainMatch?: boolean
}

export interface WebhookPayload {
  event: string
  data: {
    id: string
    merchantId: string
    amount: string
    currency: string
    status: string
    txHash: string
    senderAddress: string
    recipientAddress: string
    blockNumber: number
    orderId?: string
    description?: string
    confirmedAt: string
  }
  timestamp: string
  [key: string]: unknown
}
