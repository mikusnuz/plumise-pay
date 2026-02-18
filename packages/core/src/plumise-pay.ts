import { parsePLM } from '@plumise/core'
import type {
  PaymentConfig,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  WalletInfo,
  PaymentEventType,
  BackendPaymentInfo,
} from './types'
import { DEFAULT_CONFIG, PAYMENT_TIMEOUT_MS, PEXUS_CHROME_STORE_URL } from './constants'
import {
  detectWallet,
  connectWallet,
  getChainId,
  switchToPlumise,
  sendTransaction,
  sendERC20,
  waitForConfirmation,
  pollForPayment,
} from './wallet'
import {
  createModal,
  showModal,
  showManualTransfer,
  updateStatus,
  hideModal,
  destroyModal,
} from './modal'

export class PlumisePay {
  private config: Required<PaymentConfig>
  private listeners: Map<PaymentEventType, Set<(data: unknown) => void>>
  private abortController: AbortController | null = null

  constructor(config?: PaymentConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.listeners = new Map()
  }

  on(event: PaymentEventType, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  private emit(event: PaymentEventType, data: unknown): void {
    this.listeners.get(event)?.forEach((cb) => cb(data))
  }

  private setStatus(status: PaymentStatus, extra?: Record<string, unknown>): void {
    this.emit('status_change', { status, ...extra })
    updateStatus(status, extra as { txHash?: string; blockNumber?: number; error?: string })
  }

  async getWallet(): Promise<WalletInfo> {
    const info = detectWallet()
    if (info.type !== 'none') {
      try {
        const chainId = await getChainId()
        return { ...info, chainId }
      } catch {
        return info
      }
    }
    return info
  }

  async requestPayment(request: PaymentRequest): Promise<PaymentResult> {
    this.abortController = new AbortController()

    const walletInfo = detectWallet()
    this.emit('wallet_detected', walletInfo)

    createModal({
      theme: this.config.theme,
      locale: this.config.locale,
    })

    return new Promise<PaymentResult>((resolve) => {
      const finish = (result: PaymentResult) => {
        setTimeout(() => hideModal(), result.status === 'confirmed' ? 2000 : 0)
        resolve(result)
      }

      const handleClose = () => {
        this.abortController?.abort()
        hideModal()
        resolve({ status: 'cancelled' })
      }

      const handleRetry = () => {
        showModal(request, walletInfo, {
          onPayWithWallet: handlePayWithWallet,
          onInstallPexus: handleInstallPexus,
          onOtherWallet: handleOtherWallet,
          onManualTransfer: handleManualTransfer,
          onClose: handleClose,
          onRetry: handleRetry,
        })
      }

      const handleInstallPexus = () => {
        window.open(PEXUS_CHROME_STORE_URL, '_blank', 'noopener')
      }

      const handleOtherWallet = () => {
        handlePayWithWallet()
      }

      const handleManualTransfer = () => {
        const expiresAt = Date.now() + PAYMENT_TIMEOUT_MS
        showManualTransfer(request, expiresAt)

        const expectedWei = parsePLM(request.amount)

        pollForPayment(
          request.to,
          expectedWei,
          this.config.rpcUrl,
          (txHash) => {
            this.emit('tx_submitted', { txHash })
            this.setStatus('pending', { txHash })
          },
          this.abortController!.signal,
        )
          .then(async (txHash) => {
            const result = await waitForConfirmation(txHash, this.config.rpcUrl)
            this.emit('tx_confirmed', { txHash, ...result })
            this.setStatus('confirmed', { txHash, blockNumber: result.blockNumber })
            finish({ status: 'confirmed', txHash, blockNumber: result.blockNumber })
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err)
            if (msg === 'aborted') {
              return
            }
            this.setStatus('expired')
            finish({ status: 'expired' })
          })

        setTimeout(() => {
          if (!this.abortController?.signal.aborted) {
            this.abortController?.abort()
            this.setStatus('expired')
            finish({ status: 'expired' })
          }
        }, PAYMENT_TIMEOUT_MS)
      }

      const handlePayWithWallet = async () => {
        try {
          this.setStatus('connecting')

          const address = await connectWallet()

          const currentChainId = await getChainId()
          if (currentChainId !== this.config.chainId) {
            await switchToPlumise({
              chainId: this.config.chainId,
              name: this.config.chainName,
              rpcUrl: this.config.rpcUrl,
              explorerUrl: this.config.explorerUrl,
            })
          }

          this.setStatus('awaiting_approval')

          let txHash: string

          if (!request.token || request.token === 'native') {
            txHash = await sendTransaction(request.to, request.amount, address)
          } else {
            txHash = await sendERC20(request.token, request.to, request.amount, address)
          }

          this.emit('tx_submitted', { txHash })
          this.setStatus('pending', { txHash })

          const receipt = await waitForConfirmation(txHash, this.config.rpcUrl, 120_000)

          this.emit('tx_confirmed', { txHash, ...receipt })
          this.setStatus('confirmed', { txHash, blockNumber: receipt.blockNumber })
          finish({ status: 'confirmed', txHash, blockNumber: receipt.blockNumber })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          const isUserReject =
            msg.toLowerCase().includes('rejected') ||
            msg.toLowerCase().includes('denied') ||
            (err as { code?: number }).code === 4001

          if (isUserReject) {
            this.setStatus('cancelled')
            finish({ status: 'cancelled' })
          } else {
            this.emit('error', { error: msg })
            this.setStatus('error', { error: msg })
          }
        }
      }

      showModal(request, walletInfo, {
        onPayWithWallet: handlePayWithWallet,
        onInstallPexus: handleInstallPexus,
        onOtherWallet: handleOtherWallet,
        onManualTransfer: handleManualTransfer,
        onClose: handleClose,
        onRetry: handleRetry,
      })
    })
  }

  async confirmPayment(clientSecret: string): Promise<PaymentResult> {
    const paymentId = clientSecret.split('_secret_')[0]
    const apiUrl = this.config.apiUrl
    if (!apiUrl) throw new Error('apiUrl is required for confirmPayment')

    const infoRes = await fetch(`${apiUrl}/v1/payments/${paymentId}?clientSecret=${encodeURIComponent(clientSecret)}`)
    if (!infoRes.ok) throw new Error(`Failed to fetch payment: ${infoRes.status}`)
    const paymentInfo: BackendPaymentInfo = await infoRes.json()

    const request: PaymentRequest = {
      to: paymentInfo.recipientAddress,
      amount: paymentInfo.amount,
      token: paymentInfo.currency === 'native' ? undefined : paymentInfo.currency,
      description: paymentInfo.description,
      orderId: paymentInfo.orderId,
    }

    this.abortController = new AbortController()
    const walletInfo = detectWallet()
    this.emit('wallet_detected', walletInfo)

    createModal({ theme: this.config.theme, locale: this.config.locale })

    return new Promise<PaymentResult>((resolve) => {
      const finish = (result: PaymentResult) => {
        setTimeout(() => hideModal(), result.status === 'confirmed' ? 2000 : 0)
        resolve(result)
      }

      const handleClose = () => {
        this.abortController?.abort()
        hideModal()
        resolve({ status: 'cancelled' })
      }

      const handlePayWithWallet = async () => {
        try {
          this.setStatus('connecting')
          const address = await connectWallet()

          const currentChainId = await getChainId()
          if (currentChainId !== this.config.chainId) {
            await switchToPlumise({
              chainId: this.config.chainId,
              name: this.config.chainName,
              rpcUrl: this.config.rpcUrl,
              explorerUrl: this.config.explorerUrl,
            })
          }

          this.setStatus('awaiting_approval')

          let txHash: string
          if (!request.token || request.token === 'native') {
            txHash = await sendTransaction(request.to, request.amount, address)
          } else {
            txHash = await sendERC20(request.token, request.to, request.amount, address)
          }

          this.emit('tx_submitted', { txHash })
          this.setStatus('pending', { txHash })

          const confirmRes = await fetch(`${apiUrl}/v1/payments/${paymentId}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientSecret, txHash, senderAddress: address }),
          })
          if (!confirmRes.ok) {
            throw new Error(`Confirm failed: ${confirmRes.status}`)
          }

          const result = await this.pollBackendStatus(paymentId, clientSecret, apiUrl)
          this.emit('tx_confirmed', { txHash, ...result })
          this.setStatus(result.status as any, { txHash, blockNumber: result.blockNumber })
          finish(result)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          const isUserReject = msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied') || (err as any).code === 4001
          if (isUserReject) {
            this.setStatus('cancelled')
            finish({ status: 'cancelled' })
          } else {
            this.emit('error', { error: msg })
            this.setStatus('error', { error: msg })
          }
        }
      }

      const handleInstallPexus = () => { window.open(PEXUS_CHROME_STORE_URL, '_blank', 'noopener') }
      const handleOtherWallet = () => { handlePayWithWallet() }
      const handleManualTransfer = () => { handleClose() }
      const handleRetry = () => {
        showModal(request, walletInfo, {
          onPayWithWallet: handlePayWithWallet,
          onInstallPexus: handleInstallPexus,
          onOtherWallet: handleOtherWallet,
          onManualTransfer: handleManualTransfer,
          onClose: handleClose,
          onRetry: handleRetry,
        })
      }

      showModal(request, walletInfo, {
        onPayWithWallet: handlePayWithWallet,
        onInstallPexus: handleInstallPexus,
        onOtherWallet: handleOtherWallet,
        onManualTransfer: handleManualTransfer,
        onClose: handleClose,
        onRetry: handleRetry,
      })
    })
  }

  private async pollBackendStatus(paymentId: string, clientSecret: string, apiUrl: string): Promise<PaymentResult> {
    const deadline = Date.now() + 120_000
    while (Date.now() < deadline) {
      const res = await fetch(`${apiUrl}/v1/payments/${paymentId}?clientSecret=${encodeURIComponent(clientSecret)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'confirmed') {
          return { status: 'confirmed', txHash: data.txHash, blockNumber: data.blockNumber }
        }
        if (data.status === 'failed') {
          return { status: 'error', error: 'Transaction failed' }
        }
        if (data.status === 'expired') {
          return { status: 'expired' }
        }
      }
      await new Promise(r => setTimeout(r, 3000))
    }
    return { status: 'error', error: 'Status check timeout' }
  }

  setConfig(config: Partial<PaymentConfig>): void {
    this.config = { ...this.config, ...config }
  }

  destroy(): void {
    this.abortController?.abort()
    destroyModal()
    this.listeners.clear()
  }
}
