import { plumise } from '@plumise/core'
import { getTransaction, getTransactionReceipt, getBlockByNumber, getChainId } from './rpc.js'
import { plmToWei, addressEquals, TRANSFER_EVENT_TOPIC } from './utils.js'
import type { PlumisePayServerConfig, PaymentVerification, TransactionInfo } from './types.js'

interface RpcTransaction {
  hash: string
  from: string
  to: string
  value: string
  blockNumber: string
  blockHash: string
}

interface RpcReceipt {
  status: string
  blockNumber: string
  blockHash: string
  logs: RpcLog[]
}

interface RpcLog {
  topics: string[]
  data: string
  address: string
}

interface RpcBlock {
  timestamp: string
}

async function buildTransactionInfo(
  tx: RpcTransaction,
  receipt: RpcReceipt,
  rpcUrl: string
): Promise<TransactionInfo> {
  let timestamp: number | undefined

  try {
    const block = (await getBlockByNumber(rpcUrl, tx.blockNumber)) as RpcBlock | null
    if (block?.timestamp) {
      timestamp = parseInt(block.timestamp, 16)
    }
  } catch {
    // 타임스탬프 조회 실패는 치명적이지 않음
  }

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    blockNumber: parseInt(tx.blockNumber, 16),
    blockHash: tx.blockHash,
    status: receipt.status === '0x1' ? 'success' : 'reverted',
    timestamp,
  }
}

export async function verifyPayment(
  txHash: string,
  expected: {
    to: string
    amount: string
    chainId?: number
  },
  config?: PlumisePayServerConfig
): Promise<PaymentVerification> {
  const rpcUrl = config?.rpcUrl ?? plumise.rpcUrls.default.http[0]
  const expectedChainId = expected.chainId ?? config?.chainId ?? plumise.id

  try {
    const [receipt, tx] = await Promise.all([
      getTransactionReceipt(rpcUrl, txHash) as Promise<RpcReceipt | null>,
      getTransaction(rpcUrl, txHash) as Promise<RpcTransaction | null>,
    ])

    if (!receipt || !tx) {
      return { valid: false, error: 'Transaction not found' }
    }

    const txInfo = await buildTransactionInfo(tx, receipt, rpcUrl)

    if (txInfo.status === 'reverted') {
      return { valid: false, tx: txInfo, error: 'Transaction reverted' }
    }

    const actualChainId = await getChainId(rpcUrl)
    const chainMatch = actualChainId === expectedChainId

    const recipientMatch = addressEquals(tx.to ?? '', expected.to)

    const expectedWei = plmToWei(expected.amount)
    const actualWei = BigInt(tx.value)
    const amountMatch = actualWei === expectedWei

    const valid = chainMatch && recipientMatch && amountMatch

    return { valid, tx: txInfo, amountMatch, recipientMatch, chainMatch }
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export async function verifyERC20Payment(
  txHash: string,
  expected: {
    tokenAddress: string
    to: string
    amount: string
    decimals?: number
    chainId?: number
  },
  config?: PlumisePayServerConfig
): Promise<PaymentVerification> {
  const rpcUrl = config?.rpcUrl ?? plumise.rpcUrls.default.http[0]
  const expectedChainId = expected.chainId ?? config?.chainId ?? plumise.id
  const decimals = expected.decimals ?? 18

  try {
    const [receipt, tx] = await Promise.all([
      getTransactionReceipt(rpcUrl, txHash) as Promise<RpcReceipt | null>,
      getTransaction(rpcUrl, txHash) as Promise<RpcTransaction | null>,
    ])

    if (!receipt || !tx) {
      return { valid: false, error: 'Transaction not found' }
    }

    const txInfo = await buildTransactionInfo(tx, receipt, rpcUrl)

    if (txInfo.status === 'reverted') {
      return { valid: false, tx: txInfo, error: 'Transaction reverted' }
    }

    const actualChainId = await getChainId(rpcUrl)
    const chainMatch = actualChainId === expectedChainId

    const transferLog = receipt.logs.find((log) => {
      if (!addressEquals(log.address, expected.tokenAddress)) return false
      if (log.topics[0]?.toLowerCase() !== TRANSFER_EVENT_TOPIC) return false

      const toTopic = log.topics[2]
      if (!toTopic) return false
      const toAddress = '0x' + toTopic.slice(26)
      return addressEquals(toAddress, expected.to)
    })

    if (!transferLog) {
      return {
        valid: false,
        tx: txInfo,
        error: 'Transfer event not found for the expected recipient',
        chainMatch,
        recipientMatch: false,
        amountMatch: false,
      }
    }

    const recipientMatch = true

    const unit = 10n ** BigInt(decimals)
    const expectedWei = parseTokenAmount(expected.amount, unit)
    const actualWei = BigInt(transferLog.data)
    const amountMatch = actualWei === expectedWei

    const valid = chainMatch && recipientMatch && amountMatch

    return { valid, tx: txInfo, amountMatch, recipientMatch, chainMatch }
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

function parseTokenAmount(amount: string, unit: bigint): bigint {
  const parts = amount.split('.')
  const whole = parts[0] ?? '0'
  const decimalsLen = unit.toString().length - 1
  const fraction = (parts[1] ?? '').padEnd(decimalsLen, '0').slice(0, decimalsLen)
  return BigInt(whole) * unit + BigInt(fraction)
}
