import type { PaymentRequest, PaymentStatus, WalletInfo } from './types'
import type { Locale } from './i18n'
import { t } from './i18n'
import { PLUMISE_CHAIN } from './constants'

interface ModalConfig {
  theme: 'light' | 'dark' | 'auto'
  locale: Locale
}

interface ModalHandlers {
  onPayWithWallet: () => void
  onInstallPexus: () => void
  onOtherWallet: () => void
  onManualTransfer: () => void
  onClose: () => void
  onRetry: () => void
}

let host: HTMLElement | null = null
let shadow: ShadowRoot | null = null
let currentLocale: Locale = 'ko'
let currentTheme: 'light' | 'dark' | 'auto' = 'auto'
let handlers: Partial<ModalHandlers> = {}
let expiryTimer: ReturnType<typeof setInterval> | null = null

const STYLES = `
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    box-sizing: border-box;
  }

  *, *::before, *::after {
    box-sizing: inherit;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes checkIn {
    0% { stroke-dashoffset: 100; }
    100% { stroke-dashoffset: 0; }
  }

  .modal {
    width: 100%;
    max-width: 420px;
    border-radius: 20px;
    overflow: hidden;
    animation: slideUp 0.25s ease;
    position: relative;
  }

  .light .modal {
    background: #ffffff;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    color: #111827;
  }

  .dark .modal {
    background: #1a1a2e;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    color: #f1f5f9;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px 0;
  }

  .modal-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 13px;
  }

  .logo-text {
    font-weight: 700;
    font-size: 15px;
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: background 0.15s;
    padding: 0;
  }

  .light .close-btn {
    color: #6b7280;
  }
  .light .close-btn:hover { background: #f3f4f6; }

  .dark .close-btn {
    color: #9ca3af;
  }
  .dark .close-btn:hover { background: rgba(255,255,255,0.08); }

  .modal-body {
    padding: 20px;
  }

  .payment-info {
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .light .payment-info {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  .dark .payment-info {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .info-row:last-child { margin-bottom: 0; }

  .info-label {
    font-weight: 500;
    opacity: 0.6;
  }

  .info-value {
    font-weight: 600;
    text-align: right;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .amount-value {
    font-size: 15px;
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .desc-text {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    opacity: 0.85;
  }

  .btn {
    width: 100%;
    padding: 14px 16px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 10px;
    position: relative;
  }

  .btn:last-child { margin-bottom: 0; }

  .btn-primary {
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    color: white;
  }

  .btn-primary:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(124,58,237,0.35);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .light .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .light .btn-secondary:hover { background: #e5e7eb; }

  .dark .btn-secondary {
    background: rgba(255,255,255,0.06);
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .dark .btn-secondary:hover { background: rgba(255,255,255,0.1); }

  .btn-tag {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255,255,255,0.2);
    font-weight: 500;
    margin-left: auto;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 12px 0;
    font-size: 12px;
    opacity: 0.5;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
  }

  .light .divider::before,
  .light .divider::after { background: #e5e7eb; }

  .dark .divider::before,
  .dark .divider::after { background: rgba(255,255,255,0.1); }

  .address-box {
    border-radius: 10px;
    padding: 12px 14px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    word-break: break-all;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .light .address-box {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .dark .address-box {
    background: rgba(255,255,255,0.05);
    color: #d1d5db;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .address-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy-btn {
    border: none;
    background: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .light .copy-btn {
    color: #7c3aed;
    background: rgba(124,58,237,0.08);
  }

  .light .copy-btn:hover { background: rgba(124,58,237,0.15); }

  .dark .copy-btn {
    color: #a78bfa;
    background: rgba(124,58,237,0.15);
  }

  .dark .copy-btn:hover { background: rgba(124,58,237,0.25); }

  .status-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
    gap: 16px;
    text-align: center;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(124,58,237,0.2);
    border-top-color: #7c3aed;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .status-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .icon-success { background: rgba(16,185,129,0.1); }
  .icon-error { background: rgba(239,68,68,0.1); }
  .icon-cancel { background: rgba(107,114,128,0.1); }
  .icon-expired { background: rgba(245,158,11,0.1); }

  .status-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }

  .status-sub {
    font-size: 13px;
    opacity: 0.6;
    margin: 0;
    max-width: 300px;
  }

  .tx-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    color: #7c3aed;
    padding: 8px 16px;
    border-radius: 8px;
    background: rgba(124,58,237,0.08);
    transition: background 0.15s;
  }

  .tx-link:hover { background: rgba(124,58,237,0.15); }

  .expire-timer {
    font-size: 13px;
    opacity: 0.6;
    text-align: center;
    margin-top: 8px;
  }

  .expire-timer span {
    font-weight: 600;
    color: #f59e0b;
  }

  .waiting-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    opacity: 0.7;
    margin-top: 4px;
  }

  .waiting-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7c3aed;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  .modal-footer {
    padding: 12px 20px 16px;
    text-align: center;
    font-size: 11px;
  }

  .light .modal-footer { color: #9ca3af; }
  .dark .modal-footer { color: #6b7280; }

  .powered-link {
    text-decoration: none;
    font-weight: 500;
  }

  .light .powered-link { color: #7c3aed; }
  .dark .powered-link { color: #a78bfa; }
`

function getThemeClass(theme: 'light' | 'dark' | 'auto'): 'light' | 'dark' {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function buildInfoRow(label: string, value: string, valueClass = ''): string {
  return `
    <div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-value ${valueClass}">${value}</span>
    </div>
  `
}

function buildPaymentInfoBlock(request: PaymentRequest): string {
  const locale = currentLocale
  const rows: string[] = []

  if (request.description) {
    rows.push(buildInfoRow('', `<span class="desc-text">${request.description}</span>`))
  }

  rows.push(buildInfoRow(t(locale, 'amount'), `${request.amount} PLM`, 'amount-value'))
  rows.push(
    buildInfoRow(
      t(locale, 'recipient'),
      `${request.to.slice(0, 6)}...${request.to.slice(-4)}`,
    ),
  )
  rows.push(buildInfoRow(t(locale, 'network'), PLUMISE_CHAIN.name))

  return `<div class="payment-info">${rows.join('')}</div>`
}

function renderWalletAvailable(request: PaymentRequest, walletInfo: WalletInfo): string {
  const locale = currentLocale
  const walletName =
    walletInfo.type === 'pexus'
      ? 'Pexus'
      : walletInfo.type === 'metamask'
        ? 'MetaMask'
        : 'Wallet'

  return `
    ${buildPaymentInfoBlock(request)}
    <button class="btn btn-primary" id="pay-wallet-btn">
      ${walletName === 'Pexus' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="white" fill-opacity="0.3"/><path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
      ${t(locale, 'pay_with', { wallet: walletName })}
    </button>
    <div class="divider">또는</div>
    <button class="btn btn-secondary" id="manual-btn">
      ${t(locale, 'manual_transfer')}
    </button>
  `
}

function renderNoWallet(request: PaymentRequest): string {
  const locale = currentLocale
  return `
    ${buildPaymentInfoBlock(request)}
    <button class="btn btn-primary" id="install-pexus-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L12 16M12 16L8 12M12 16L16 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20H20" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
      ${t(locale, 'install_pexus')}
      <span class="btn-tag">${t(locale, 'install_pexus_desc')}</span>
    </button>
    <button class="btn btn-secondary" id="other-wallet-btn">
      ${t(locale, 'other_wallet')}
    </button>
    <button class="btn btn-secondary" id="manual-btn">
      ${t(locale, 'manual_transfer')}
    </button>
  `
}

function renderManualTransfer(request: PaymentRequest, expiresAt: number): string {
  const locale = currentLocale
  const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`

  return `
    ${buildPaymentInfoBlock(request)}
    <div style="margin-bottom:8px;font-size:13px;font-weight:600;opacity:0.7;">${t(locale, 'recipient')}</div>
    <div class="address-box">
      <span class="address-text">${request.to}</span>
      <button class="copy-btn" id="copy-addr-btn">${t(locale, 'copy_address')}</button>
    </div>
    <div style="margin-top:8px;margin-bottom:4px;font-size:13px;font-weight:600;opacity:0.7;">${t(locale, 'amount')}</div>
    <div class="address-box" style="font-size:16px;font-weight:700;">
      <span>${request.amount} PLM</span>
      <button class="copy-btn" id="copy-amount-btn">${t(locale, 'copy_address')}</button>
    </div>
    <div class="waiting-status">
      <div class="waiting-dot"></div>
      <span>${t(locale, 'waiting')}</span>
    </div>
    <div class="expire-timer" id="expire-timer">
      ${t(locale, 'expires_in', { time: `<span>${timeStr}</span>` })}
    </div>
  `
}

function renderProcessing(txHash?: string): string {
  const locale = currentLocale
  return `
    <div class="status-center">
      <div class="spinner"></div>
      <p class="status-title">${t(locale, 'processing')}</p>
      ${txHash ? `<a class="tx-link" href="${PLUMISE_CHAIN.explorerUrl}/tx/${txHash}" target="_blank" rel="noopener">${t(locale, 'view_tx')} ↗</a>` : ''}
    </div>
  `
}

function renderConfirmed(txHash?: string, blockNumber?: number): string {
  const locale = currentLocale
  return `
    <div class="status-center">
      <div class="status-icon icon-success">✅</div>
      <p class="status-title">${t(locale, 'confirmed')}</p>
      ${blockNumber ? `<p class="status-sub">Block #${blockNumber}</p>` : ''}
      ${txHash ? `<a class="tx-link" href="${PLUMISE_CHAIN.explorerUrl}/tx/${txHash}" target="_blank" rel="noopener">${t(locale, 'view_tx')} ↗</a>` : ''}
    </div>
  `
}

function renderCancelled(): string {
  const locale = currentLocale
  return `
    <div class="status-center">
      <div class="status-icon icon-cancel">✕</div>
      <p class="status-title">${t(locale, 'cancelled')}</p>
      <button class="btn btn-secondary" id="close-final-btn" style="margin-top:8px;max-width:200px;">
        ${t(locale, 'close')}
      </button>
    </div>
  `
}

function renderExpired(): string {
  const locale = currentLocale
  return `
    <div class="status-center">
      <div class="status-icon icon-expired">⏱</div>
      <p class="status-title">${t(locale, 'expired')}</p>
      <button class="btn btn-secondary" id="close-final-btn" style="margin-top:8px;max-width:200px;">
        ${t(locale, 'close')}
      </button>
    </div>
  `
}

function renderError(message?: string): string {
  const locale = currentLocale
  return `
    <div class="status-center">
      <div class="status-icon icon-error">⚠</div>
      <p class="status-title">${t(locale, 'error')}</p>
      ${message ? `<p class="status-sub">${message}</p>` : ''}
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn btn-secondary" id="retry-btn" style="max-width:120px;">${t(locale, 'retry')}</button>
        <button class="btn btn-secondary" id="close-final-btn" style="max-width:120px;">${t(locale, 'close')}</button>
      </div>
    </div>
  `
}

function getThemeWrapper(): HTMLElement | null {
  return shadow?.querySelector('.theme-wrapper') ?? null
}

function getModalBody(): HTMLElement | null {
  return shadow?.querySelector('.modal-body') ?? null
}

function attachBodyListeners(request: PaymentRequest): void {
  const body = getModalBody()
  if (!body) return

  body.querySelector('#pay-wallet-btn')?.addEventListener('click', () => handlers.onPayWithWallet?.())
  body.querySelector('#install-pexus-btn')?.addEventListener('click', () => handlers.onInstallPexus?.())
  body.querySelector('#other-wallet-btn')?.addEventListener('click', () => handlers.onOtherWallet?.())
  body.querySelector('#manual-btn')?.addEventListener('click', () => handlers.onManualTransfer?.())
  body.querySelector('#close-final-btn')?.addEventListener('click', () => handlers.onClose?.())
  body.querySelector('#retry-btn')?.addEventListener('click', () => handlers.onRetry?.())

  const copyAddrBtn = body.querySelector('#copy-addr-btn') as HTMLButtonElement | null
  if (copyAddrBtn) {
    copyAddrBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(request.to).then(() => {
        copyAddrBtn.textContent = t(currentLocale, 'copied')
        setTimeout(() => {
          copyAddrBtn.textContent = t(currentLocale, 'copy_address')
        }, 2000)
      })
    })
  }

  const copyAmountBtn = body.querySelector('#copy-amount-btn') as HTMLButtonElement | null
  if (copyAmountBtn) {
    copyAmountBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(request.amount).then(() => {
        copyAmountBtn.textContent = t(currentLocale, 'copied')
        setTimeout(() => {
          copyAmountBtn.textContent = t(currentLocale, 'copy_address')
        }, 2000)
      })
    })
  }
}

function startExpiryTimer(expiresAt: number): void {
  if (expiryTimer) clearInterval(expiryTimer)

  expiryTimer = setInterval(() => {
    const timerEl = shadow?.querySelector('#expire-timer')
    if (!timerEl) {
      if (expiryTimer) clearInterval(expiryTimer)
      return
    }

    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`
    timerEl.innerHTML = t(currentLocale, 'expires_in', {
      time: `<span>${timeStr}</span>`,
    })
  }, 1000)
}

export function createModal(config: ModalConfig): void {
  if (host) return

  currentLocale = config.locale
  currentTheme = config.theme

  host = document.createElement('div')
  host.id = '__plumise-pay-modal__'
  shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = STYLES
  shadow.appendChild(style)

  document.body.appendChild(host)
}

export function showModal(
  request: PaymentRequest,
  walletInfo: WalletInfo,
  hdlrs: Partial<ModalHandlers>,
): void {
  if (!shadow) return

  handlers = hdlrs
  const themeClass = getThemeClass(currentTheme)
  const locale = currentLocale

  const existingWrapper = shadow.querySelector('.theme-wrapper')
  if (existingWrapper) existingWrapper.remove()

  const wrapper = document.createElement('div')
  wrapper.className = `theme-wrapper ${themeClass}`
  wrapper.innerHTML = `
    <div class="overlay" id="overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Plumise Payment">
        <div class="modal-header">
          <div class="modal-logo">
            <div class="logo-icon">P</div>
            <span class="logo-text">Plumise Pay</span>
          </div>
          <button class="close-btn" id="modal-close-btn" aria-label="${t(locale, 'close')}">✕</button>
        </div>
        <div class="modal-body">
          ${walletInfo.type !== 'none'
            ? renderWalletAvailable(request, walletInfo)
            : renderNoWallet(request)
          }
        </div>
        <div class="modal-footer">
          <a class="powered-link" href="${PLUMISE_CHAIN.explorerUrl}" target="_blank" rel="noopener">
            ${t(locale, 'powered_by')}
          </a>
        </div>
      </div>
    </div>
  `

  shadow.appendChild(wrapper)

  wrapper.querySelector('#modal-close-btn')?.addEventListener('click', () => handlers.onClose?.())
  wrapper.querySelector('#overlay')?.addEventListener('click', (e) => {
    if (e.target === wrapper.querySelector('#overlay')) handlers.onClose?.()
  })

  attachBodyListeners(request)
}

export function showManualTransfer(request: PaymentRequest, expiresAt: number): void {
  const body = getModalBody()
  if (!body) return

  body.innerHTML = renderManualTransfer(request, expiresAt)
  attachBodyListeners(request)
  startExpiryTimer(expiresAt)
}

export function updateStatus(
  status: PaymentStatus,
  extra?: { txHash?: string; blockNumber?: number; error?: string },
): void {
  const body = getModalBody()
  if (!body) return

  if (expiryTimer && status !== 'pending') {
    clearInterval(expiryTimer)
    expiryTimer = null
  }

  switch (status) {
    case 'connecting':
    case 'awaiting_approval':
    case 'pending':
      body.innerHTML = renderProcessing(extra?.txHash)
      break
    case 'confirmed':
      body.innerHTML = renderConfirmed(extra?.txHash, extra?.blockNumber)
      break
    case 'cancelled':
      body.innerHTML = renderCancelled()
      body.querySelector('#close-final-btn')?.addEventListener('click', () => handlers.onClose?.())
      break
    case 'expired':
      body.innerHTML = renderExpired()
      body.querySelector('#close-final-btn')?.addEventListener('click', () => handlers.onClose?.())
      break
    case 'error':
      body.innerHTML = renderError(extra?.error)
      body.querySelector('#close-final-btn')?.addEventListener('click', () => handlers.onClose?.())
      body.querySelector('#retry-btn')?.addEventListener('click', () => handlers.onRetry?.())
      break
  }
}

export function hideModal(): void {
  if (expiryTimer) {
    clearInterval(expiryTimer)
    expiryTimer = null
  }

  const wrapper = getThemeWrapper()
  if (wrapper) {
    wrapper.style.opacity = '0'
    wrapper.style.transition = 'opacity 0.2s ease'
    setTimeout(() => {
      wrapper.remove()
    }, 200)
  }
}

export function destroyModal(): void {
  hideModal()
  if (host) {
    host.remove()
    host = null
    shadow = null
  }
}
