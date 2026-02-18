import { ref, type Ref } from 'vue'
import type { PaymentRequest, PaymentResult, PaymentStatus, WalletInfo } from '@plumise/pay'
import { usePlumisePay } from './plugin'

export function usePayment() {
  const pay = usePlumisePay()
  const status: Ref<PaymentStatus> = ref('idle')
  const result: Ref<PaymentResult | null> = ref(null)
  const error: Ref<string | null> = ref(null)

  async function requestPayment(request: PaymentRequest): Promise<PaymentResult> {
    status.value = 'connecting'
    error.value = null
    result.value = null

    const unsubscribe = pay.on('status_change', (data: any) => {
      status.value = data.status
    })

    try {
      const res = await pay.requestPayment(request)
      result.value = res
      status.value = res.status === 'confirmed' ? 'confirmed' : (res.status as PaymentStatus)
      return res
    } catch (err: any) {
      error.value = err.message
      status.value = 'error'
      return { status: 'error' as const, error: err.message }
    } finally {
      unsubscribe()
    }
  }

  function reset() {
    status.value = 'idle'
    result.value = null
    error.value = null
  }

  return { requestPayment, status, result, error, reset }
}

export function useConfirmPayment() {
  const pay = usePlumisePay()
  const status: Ref<PaymentStatus> = ref('idle')
  const result: Ref<PaymentResult | null> = ref(null)
  const error: Ref<string | null> = ref(null)

  async function confirmPayment(clientSecret: string): Promise<PaymentResult> {
    status.value = 'connecting'
    error.value = null
    result.value = null

    const unsubscribe = pay.on('status_change', (data: any) => {
      status.value = data.status
    })

    try {
      const res = await pay.confirmPayment(clientSecret)
      result.value = res
      status.value = res.status === 'confirmed' ? 'confirmed' : (res.status as PaymentStatus)
      return res
    } catch (err: any) {
      error.value = err.message
      status.value = 'error'
      return { status: 'error' as const, error: err.message }
    } finally {
      unsubscribe()
    }
  }

  function reset() {
    status.value = 'idle'
    result.value = null
    error.value = null
  }

  return { confirmPayment, status, result, error, reset }
}

export function useWallet() {
  const pay = usePlumisePay()
  const wallet: Ref<WalletInfo | null> = ref(null)
  const loading = ref(false)

  async function detect() {
    loading.value = true
    try {
      const info = await pay.getWallet()
      wallet.value = info
      return info
    } finally {
      loading.value = false
    }
  }

  return { wallet, loading, detect }
}
