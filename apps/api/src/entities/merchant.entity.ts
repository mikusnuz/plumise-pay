import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiKey } from './api-key.entity';
import { Payment } from './payment.entity';
import { Webhook } from './webhook.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ApiKey, (k) => k.merchant)
  apiKeys: ApiKey[];

  @OneToMany(() => Payment, (p) => p.merchant)
  payments: Payment[];

  @OneToMany(() => Webhook, (w) => w.merchant)
  webhooks: Webhook[];
}
