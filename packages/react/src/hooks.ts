import { useState, useCallback } from 'react'
import type { PaymentRequest, PaymentResult, PaymentStatus, WalletInfo } from '@plumise/pay'
import { usePlumisePay } from './context'

export function usePayment() {
  const pay = usePlumisePay()
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const requestPayment = useCallback(async (request: PaymentRequest) => {
    setStatus('connecting')
    setError(null)
    setResult(null)

    const unsubscribe = pay.on('status_change', (data) => {
      setStatus((data as { status: PaymentStatus }).status)
    })

    try {
      const res = await pay.requestPayment(request)
      setResult(res)
      setStatus(res.status === 'confirmed' ? 'confirmed' : (res.status as PaymentStatus))
      return res
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setStatus('error')
      return { status: 'error' as const, error: message }
    } finally {
      unsubscribe()
    }
  }, [pay])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { requestPayment, status, result, error, reset }
}

export function useConfirmPayment() {
  const pay = usePlumisePay()
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const confirmPayment = useCallback(async (clientSecret: string) => {
    setStatus('connecting')
    setError(null)
    setResult(null)

    const unsubscribe = pay.on('status_change', (data) => {
      setStatus((data as { status: PaymentStatus }).status)
    })

    try {
      const res = await pay.confirmPayment(clientSecret)
      setResult(res)
      setStatus(res.status === 'confirmed' ? 'confirmed' : (res.status as PaymentStatus))
      return res
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setStatus('error')
      return { status: 'error' as const, error: message }
    } finally {
      unsubscribe()
    }
  }, [pay])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { confirmPayment, status, result, error, reset }
}

export function useWallet() {
  const pay = usePlumisePay()
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const detect = useCallback(async () => {
    setLoading(true)
    try {
      const info = await pay.getWallet()
      setWallet(info)
      return info
    } finally {
      setLoading(false)
    }
  }, [pay])

  return { wallet, loading, detect }
}
