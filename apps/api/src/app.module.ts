import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './modules/health/health.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '192.168.0.200',
      port: parseInt(process.env.DB_PORT || '15411', 10),
      username: process.env.DB_USER || 'plumise-manager',
      password: process.env.DB_PASS || 'plumbug!db!1q2w3e4r',
      database: process.env.DB_NAME || 'plumise_pay',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    HealthModule,
    MerchantsModule,
    ApiKeysModule,
    PaymentsModule,
    WebhooksModule,
    BlockchainModule,
  ],
})
export class AppModule {}
