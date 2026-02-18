import { createContext, useContext, useRef, useEffect } from 'react'
import { PlumisePay, type PaymentConfig } from '@plumise/pay'

const PlumisePayContext = createContext<PlumisePay | null>(null)

export function PlumisePayProvider({
  config,
  children,
}: {
  config?: PaymentConfig
  children: React.ReactNode
}) {
  const payRef = useRef<PlumisePay | null>(null)

  if (!payRef.current) {
    payRef.current = new PlumisePay(config)
  }

  useEffect(() => {
    return () => {
      payRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    if (config) payRef.current?.setConfig(config)
  }, [config])

  return (
    <PlumisePayContext.Provider value={payRef.current}>
      {children}
    </PlumisePayContext.Provider>
  )
}

export function usePlumisePay() {
  const ctx = useContext(PlumisePayContext)
  if (!ctx) throw new Error('usePlumisePay must be used within PlumisePayProvider')
  return ctx
}
