import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RpcService } from './rpc.service';
import { PaymentsService } from '../modules/payments/payments.service';
import { WebhookDispatcherService } from '../modules/webhooks/webhook-dispatcher.service';
import WebSocket from 'ws';

@Injectable()
export class BlockchainMonitorService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainMonitorService.name);
  private ws: WebSocket | null = null;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly rpc: RpcService,
    private readonly payments: PaymentsService,
    private readonly webhookDispatcher: WebhookDispatcherService,
  ) {}

  onModuleInit() {
    this.startMonitoring();
  }

  private startMonitoring() {
    try {
      this.subscribeWs();
    } catch {
      this.logger.warn('WebSocket unavailable, falling back to polling');
      this.startPolling();
    }
  }

  private subscribeWs() {
    this.ws = new WebSocket(this.rpc.wsUrl);

    this.ws.on('open', () => {
      this.logger.log('WebSocket connected');
      this.ws!.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_subscribe',
          params: ['newHeads'],
        }),
      );
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.params?.result?.number) {
          this.onNewBlock().catch((e) =>
            this.logger.error('Block processing error', e.message),
          );
        }
      } catch {}
    });

    this.ws.on('error', (err) => {
      this.logger.warn(`WebSocket error: ${err.message}, switching to polling`);
      this.ws?.close();
      this.ws = null;
      this.startPolling();
    });

    this.ws.on('close', () => {
      this.logger.warn('WebSocket closed, reconnecting in 5s...');
      this.ws = null;
      setTimeout(() => this.startMonitoring(), 5000);
    });
  }

  private startPolling() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      this.onNewBlock().catch((e) =>
        this.logger.error('Poll processing error', e.message),
      );
    }, 15000);
    this.logger.log('Polling started (15s interval)');
  }

  private async onNewBlock(): Promise<void> {
    const processing = await this.payments.findProcessing();
    if (processing.length === 0) return;

    for (const payment of processing) {
      if (!payment.txHash) continue;

      try {
        const receipt = await this.rpc.getTransactionReceipt(payment.txHash);
        if (!receipt) continue;

        const blockNumber = parseInt(receipt.blockNumber, 16);

        if (receipt.status === '0x1') {
          await this.payments.markConfirmed(payment.id, blockNumber);
          this.logger.log(
            `Payment ${payment.id} confirmed at block ${blockNumber}`,
          );
          await this.webhookDispatcher.dispatch(
            payment.merchantId,
            'payment.confirmed',
            {
              id: payment.id,
              status: 'confirmed',
              txHash: payment.txHash,
              blockNumber,
              amount: payment.amount,
              currency: payment.currency,
              orderId: payment.orderId,
            },
          );
        } else if (receipt.status === '0x0') {
          await this.payments.markFailed(payment.id);
          this.logger.warn(`Payment ${payment.id} tx failed`);
          await this.webhookDispatcher.dispatch(
            payment.merchantId,
            'payment.failed',
            {
              id: payment.id,
              status: 'failed',
              txHash: payment.txHash,
              amount: payment.amount,
              currency: payment.currency,
              orderId: payment.orderId,
            },
          );
        }
      } catch (err: any) {
        this.logger.error(
          `Error checking tx ${payment.txHash}: ${err.message}`,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiry() {
    const count = await this.payments.expireOverdue();
    if (count > 0) {
      this.logger.log(`Expired ${count} overdue payment(s)`);
    }
  }
}
