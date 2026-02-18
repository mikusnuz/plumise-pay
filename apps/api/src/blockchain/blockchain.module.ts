import { Module } from '@nestjs/common';
import { RpcService } from './rpc.service';
import { BlockchainMonitorService } from './blockchain-monitor.service';
import { PaymentsModule } from '../modules/payments/payments.module';
import { WebhooksModule } from '../modules/webhooks/webhooks.module';

@Module({
  imports: [PaymentsModule, WebhooksModule],
  providers: [RpcService, BlockchainMonitorService],
  exports: [RpcService],
})
export class BlockchainModule {}
