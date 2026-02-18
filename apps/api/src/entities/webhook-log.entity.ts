import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Webhook } from './webhook.entity';

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  webhookId: string;

  @ManyToOne(() => Webhook, (w) => w.logs)
  @JoinColumn({ name: 'webhookId' })
  webhook: Webhook;

  @Column({ length: 36 })
  paymentId: string;

  @Column({ length: 100 })
  event: string;

  @Column({ type: 'json' })
  payload: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  statusCode: number | null;

  @Column({ type: 'text', nullable: true })
  response: string | null;

  @Column({ type: 'int', default: 0 })
  attempt: number;

  @CreateDateColumn()
  createdAt: Date;
}
