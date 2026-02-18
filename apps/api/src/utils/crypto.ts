import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export function hmacSha256Hex(secret: string, value: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function constantTimeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function generateSecretKey(): string {
  return `sk_live_${randomBytes(32).toString('base64url')}`;
}

export function generatePublishableKey(): string {
  return `pk_live_${randomBytes(32).toString('base64url')}`;
}

export function generateClientSecret(paymentId: string): string {
  return `${paymentId}_secret_${randomBytes(24).toString('base64url')}`;
}

export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString('hex')}`;
}

export function apiKeyPrefix(key: string): string {
  return key.slice(0, 14);
}
