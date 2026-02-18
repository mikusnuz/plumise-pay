const messages = {
  ko: {
    pay_with: '{wallet}(으)로 결제',
    install_pexus: 'Pexus 설치하기',
    install_pexus_desc: '추천 · 원클릭 결제',
    other_wallet: '다른 지갑으로 결제',
    manual_transfer: '직접 전송하기',
    processing: '처리 중...',
    confirmed: '결제 완료',
    cancelled: '결제 취소됨',
    expired: '결제 만료됨',
    error: '결제 실패',
    copy_address: '주소 복사',
    copied: '복사됨',
    amount: '금액',
    recipient: '받는 주소',
    network: '네트워크',
    waiting: '입금 대기 중...',
    expires_in: '{time} 남음',
    powered_by: 'Powered by Plumise',
    close: '닫기',
    retry: '다시 시도',
    view_tx: '트랜잭션 보기',
    switch_network: '네트워크 전환',
    switch_network_desc: 'Plumise 네트워크로 전환합니다',
    connect_wallet: '지갑 연결',
  },
  en: {
    pay_with: 'Pay with {wallet}',
    install_pexus: 'Install Pexus',
    install_pexus_desc: 'Recommended · One-click payment',
    other_wallet: 'Pay with other wallet',
    manual_transfer: 'Transfer manually',
    processing: 'Processing...',
    confirmed: 'Payment Complete',
    cancelled: 'Payment Cancelled',
    expired: 'Payment Expired',
    error: 'Payment Failed',
    copy_address: 'Copy address',
    copied: 'Copied',
    amount: 'Amount',
    recipient: 'Recipient',
    network: 'Network',
    waiting: 'Waiting for payment...',
    expires_in: '{time} remaining',
    powered_by: 'Powered by Plumise',
    close: 'Close',
    retry: 'Retry',
    view_tx: 'View Transaction',
    switch_network: 'Switch Network',
    switch_network_desc: 'Switching to Plumise network',
    connect_wallet: 'Connect Wallet',
  },
} as const

export type Locale = keyof typeof messages
export type MessageKey = keyof (typeof messages)['ko']

export function t(locale: Locale, key: MessageKey, vars?: Record<string, string>): string {
  let msg: string = messages[locale]?.[key] ?? messages['en'][key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(`{${k}}`, v)
    }
  }
  return msg
}
