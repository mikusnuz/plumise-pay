import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';

export enum PaymentStatus {
  CREATED = 'created',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @ManyToOne(() => Merchant, (m) => m.payments)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column({ length: 128, unique: true })
  clientSecret: string;

  @Column({ length: 78 })
  amount: string;

  @Column({ length: 42, default: 'native' })
  currency: string;

  @Column({ length: 42 })
  recipientAddress: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.CREATED })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 66, nullable: true })
  txHash: string | null;

  @Column({ type: 'varchar', length: 42, nullable: true })
  senderAddress: string | null;

  @Column({ type: 'int', nullable: true })
  blockNumber: number | null;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date | null;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  orderId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
