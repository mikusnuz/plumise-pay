import { createHmac, timingSafeEqual } from 'node:crypto'
import type { WebhookPayload } from './types.js'

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(typeof payload === 'string' ? payload : payload)
  const digest = 'sha256=' + hmac.digest('hex')

  try {
    const sigBuffer = Buffer.from(signature)
    const digestBuffer = Buffer.from(digest)

    if (sigBuffer.length !== digestBuffer.length) {
      // 길이 불일치 시에도 타이밍 공격 방지를 위해 비교 수행
      const padded = Buffer.alloc(digestBuffer.length, 0)
      sigBuffer.copy(padded, 0, 0, Math.min(sigBuffer.length, padded.length))
      timingSafeEqual(padded, digestBuffer)
      return false
    }

    return timingSafeEqual(sigBuffer, digestBuffer)
  } catch {
    return false
  }
}

export function parseWebhook(
  rawBody: string | Buffer,
  signatureHeader: string,
  secret: string
): WebhookPayload {
  if (!verifyWebhookSignature(rawBody, signatureHeader, secret)) {
    throw new Error('Invalid webhook signature')
  }

  const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
  return JSON.parse(bodyStr) as WebhookPayload
}
