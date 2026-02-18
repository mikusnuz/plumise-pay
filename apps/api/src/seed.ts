import { DataSource } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { ApiKey, ApiKeyType } from './entities/api-key.entity';
import { Payment } from './entities/payment.entity';
import { Webhook } from './entities/webhook.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import {
  generateSecretKey,
  generatePublishableKey,
  hmacSha256Hex,
  apiKeyPrefix,
} from './utils/crypto';

async function seed() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || '192.168.0.200',
    port: parseInt(process.env.DB_PORT || '15411', 10),
    username: process.env.DB_USER || 'plumise-manager',
    password: process.env.DB_PASS || 'plumbug!db!1q2w3e4r',
    database: process.env.DB_NAME || 'plumise_pay',
    entities: [Merchant, ApiKey, Payment, Webhook, WebhookLog],
    synchronize: false,
  });

  await ds.initialize();
  console.log('Connected to database');

  const merchantRepo = ds.getRepository(Merchant);
  const apiKeyRepo = ds.getRepository(ApiKey);

  let merchant = await merchantRepo.findOne({
    where: { email: 'demo@plumise.com' },
  });

  if (!merchant) {
    merchant = await merchantRepo.save(
      merchantRepo.create({
        name: 'Demo Merchant',
        email: 'demo@plumise.com',
      }),
    );
    console.log('Created demo merchant:', merchant.id);
  } else {
    console.log('Demo merchant already exists:', merchant.id);
  }

  const hmacSecret = process.env.HMAC_SECRET || 'plumise-pay-hmac-secret-v1';

  const pkRaw = generatePublishableKey();
  await apiKeyRepo.save(
    apiKeyRepo.create({
      merchantId: merchant.id,
      name: 'Default Publishable',
      type: ApiKeyType.PUBLISHABLE,
      keyHash: hmacSha256Hex(hmacSecret, pkRaw),
      prefix: apiKeyPrefix(pkRaw),
    }),
  );

  const skRaw = generateSecretKey();
  await apiKeyRepo.save(
    apiKeyRepo.create({
      merchantId: merchant.id,
      name: 'Default Secret',
      type: ApiKeyType.SECRET,
      keyHash: hmacSha256Hex(hmacSecret, skRaw),
      prefix: apiKeyPrefix(skRaw),
    }),
  );

  console.log('\n=== API Keys (save these, they won\'t be shown again) ===');
  console.log('Publishable key:', pkRaw);
  console.log('Secret key:     ', skRaw);
  console.log('========================================================\n');

  await ds.destroy();
  console.log('Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
