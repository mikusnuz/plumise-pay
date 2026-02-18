import { plumise } from '@plumise/core'
import { verifyPayment, verifyERC20Payment } from './verify.js'
import { verifyWebhookSignature, parseWebhook } from './webhook.js'
import { getBalance as rpcGetBalance, getChainId } from './rpc.js'
import { weiToPlm } from './utils.js'
import type {
  PlumisePayServerConfig,
  PaymentVerification,
  WebhookPayload,
} from './types.js'

export class PlumisePayServer {
  private config: Required<PlumisePayServerConfig>

  constructor(config?: PlumisePayServerConfig) {
    this.config = {
      rpcUrl: config?.rpcUrl ?? plumise.rpcUrls.default.http[0],
      chainId: config?.chainId ?? plumise.id,
      webhookSecret: config?.webhookSecret ?? '',
    }
  }

  async verifyPayment(
    txHash: string,
    expected: { to: string; amount: string }
  ): Promise<PaymentVerification> {
    return verifyPayment(txHash, { ...expected, chainId: this.config.chainId }, this.config)
  }

  async verifyERC20Payment(
    txHash: string,
    expected: {
      tokenAddress: string
      to: string
      amount: string
      decimals?: number
    }
  ): Promise<PaymentVerification> {
    return verifyERC20Payment(
      txHash,
      { ...expected, chainId: this.config.chainId },
      this.config
    )
  }

  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookPayload {
    if (!this.config.webhookSecret) {
      throw new Error('webhookSecret is not configured')
    }
    return parseWebhook(rawBody, signature, this.config.webhookSecret)
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!this.config.webhookSecret) {
      throw new Error('webhookSecret is not configured')
    }
    return verifyWebhookSignature(rawBody, signature, this.config.webhookSecret)
  }

  async getBalance(address: string): Promise<string> {
    const weiHex = await rpcGetBalance(this.config.rpcUrl, address)
    return weiToPlm(BigInt(weiHex))
  }

  async ping(): Promise<boolean> {
    try {
      const chainId = await getChainId(this.config.rpcUrl)
      return chainId === this.config.chainId
    } catch {
      return false
    }
  }
}
