import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { WebhookLog } from './webhook-log.entity';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @ManyToOne(() => Merchant, (m) => m.webhooks)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column({ length: 2048 })
  url: string;

  @Column({ length: 128 })
  secret: string;

  @Column('simple-array')
  events: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => WebhookLog, (l) => l.webhook)
  logs: WebhookLog[];
}
