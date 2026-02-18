import { parsePLM, formatPLM } from '@plumise/core'

export function plmToWei(plm: string): bigint {
  return parsePLM(plm)
}

export function weiToPlm(wei: bigint | string): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei
  return formatPLM(weiValue)
}

export function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}

export function addressEquals(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}

export const TRANSFER_EVENT_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
