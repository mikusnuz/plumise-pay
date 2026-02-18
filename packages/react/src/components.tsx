import React, { useCallback } from 'react'
import type { PaymentRequest, PaymentResult } from '@plumise/pay'
import { usePayment } from './hooks'

export interface PayButtonProps {
  request: PaymentRequest
  onSuccess?: (result: PaymentResult) => void
  onCancel?: () => void
  onError?: (error: string) => void
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

export function PayButton({
  request,
  onSuccess,
  onCancel,
  onError,
  className,
  children,
  disabled,
}: PayButtonProps) {
  const { requestPayment, status } = usePayment()

  const handleClick = useCallback(async () => {
    const result = await requestPayment(request)
    if (result.status === 'confirmed') onSuccess?.(result)
    else if (result.status === 'cancelled') onCancel?.()
    else if (result.status === 'error') onError?.(result.error || 'Unknown error')
  }, [request, requestPayment, onSuccess, onCancel, onError])

  const isLoading =
    status !== 'idle' &&
    status !== 'confirmed' &&
    status !== 'cancelled' &&
    status !== 'error' &&
    status !== 'expired'

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className}
      style={
        !className
          ? {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0891b2, #7c3aed)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: isLoading || disabled ? 'not-allowed' : 'pointer',
              opacity: isLoading || disabled ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }
          : undefined
      }
    >
      {children || (
        <>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          {isLoading ? 'Processing...' : 'Pay with PLM'}
        </>
      )}
    </button>
  )
}
