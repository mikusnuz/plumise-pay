import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook, WebhookLog, ApiKey } from '../../entities';
import { WebhooksController } from './webhooks.controller';
import { WebhookDispatcherService } from './webhook-dispatcher.service';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook, WebhookLog, ApiKey])],
  controllers: [WebhooksController],
  providers: [WebhookDispatcherService],
  exports: [WebhookDispatcherService],
})
export class WebhooksModule {}
