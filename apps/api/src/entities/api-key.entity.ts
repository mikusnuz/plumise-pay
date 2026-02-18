import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';

export enum ApiKeyType {
  PUBLISHABLE = 'publishable',
  SECRET = 'secret',
}

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @ManyToOne(() => Merchant, (m) => m.apiKeys)
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column({ length: 64 })
  name: string;

  @Column({ type: 'enum', enum: ApiKeyType })
  type: ApiKeyType;

  @Column({ length: 64 })
  keyHash: string;

  @Column({ length: 32 })
  prefix: string;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
