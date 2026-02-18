import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook, WebhookLog } from '../../entities';
import { createHmac } from 'crypto';

const RETRY_DELAYS = [1000, 5000, 30000];
const FETCH_TIMEOUT = 10000;

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepo: Repository<Webhook>,
    @InjectRepository(WebhookLog)
    private readonly logRepo: Repository<WebhookLog>,
  ) {}

  async dispatch(
    merchantId: string,
    event: string,
    payload: Record<string, any>,
  ): Promise<void> {
    const webhooks = await this.webhookRepo.find({
      where: { merchantId, isActive: true },
    });

    const matching = webhooks.filter((w) => w.events.includes(event));

    for (const webhook of matching) {
      this.deliverWithRetry(webhook, event, payload).catch((err) =>
        this.logger.error(
          `Webhook delivery failed: ${webhook.id}`,
          err.message,
        ),
      );
    }
  }

  private async deliverWithRetry(
    webhook: Webhook,
    event: string,
    payload: Record<string, any>,
  ): Promise<void> {
    const body = JSON.stringify(payload);
    const signature = createHmac('sha256', webhook.secret)
      .update(body)
      .digest('hex');

    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      if (attempt > 0) {
        await this.sleep(RETRY_DELAYS[attempt - 1]);
      }

      const log = this.logRepo.create({
        webhookId: webhook.id,
        paymentId: payload.id || '',
        event,
        payload,
        attempt,
      });

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const res = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-PlumisePay-Signature': `sha256=${signature}`,
            'X-PlumisePay-Event': event,
          },
          body,
          signal: controller.signal,
        });

        clearTimeout(timer);

        log.statusCode = res.status;
        log.response = await res.text().catch(() => '');
        await this.logRepo.save(log);

        if (res.ok) return;
      } catch (err: any) {
        log.statusCode = 0;
        log.response = err.message;
        await this.logRepo.save(log);
      }
    }

    this.logger.warn(
      `All retries exhausted for webhook ${webhook.id}, event ${event}`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
