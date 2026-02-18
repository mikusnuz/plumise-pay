import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { randomUUID } from 'crypto';
import { Payment, PaymentStatus, Merchant } from '../../entities';
import { generateClientSecret } from '../../utils/crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async create(merchant: Merchant, dto: CreatePaymentDto): Promise<Payment> {
    const id = randomUUID();
    const payment = this.paymentRepo.create({
      id,
      merchantId: merchant.id,
      clientSecret: generateClientSecret(id),
      amount: dto.amount,
      currency: dto.currency || 'native',
      recipientAddress: dto.recipientAddress,
      orderId: dto.orderId,
      description: dto.description,
      metadata: dto.metadata,
      expiresAt: new Date(
        Date.now() + (dto.expiresInMinutes || 30) * 60 * 1000,
      ),
    });

    return this.paymentRepo.save(payment);
  }

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findByMerchant(
    merchantId: string,
    page = 1,
    limit = 20,
    status?: PaymentStatus,
  ): Promise<{ data: Payment[]; total: number }> {
    const where: any = { merchantId };
    if (status) where.status = status;

    const [data, total] = await this.paymentRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async confirm(
    id: string,
    clientSecret: string,
    txHash: string,
    senderAddress?: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id, clientSecret },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.CREATED) {
      throw new BadRequestException(
        `Cannot confirm payment in '${payment.status}' status`,
      );
    }

    if (payment.expiresAt < new Date()) {
      payment.status = PaymentStatus.EXPIRED;
      await this.paymentRepo.save(payment);
      throw new BadRequestException('Payment has expired');
    }

    payment.status = PaymentStatus.PROCESSING;
    payment.txHash = txHash;
    payment.senderAddress = senderAddress || null;

    return this.paymentRepo.save(payment);
  }

  async expireOverdue(): Promise<number> {
    const result = await this.paymentRepo.update(
      {
        status: PaymentStatus.CREATED,
        expiresAt: LessThan(new Date()),
      },
      { status: PaymentStatus.EXPIRED },
    );
    return result.affected || 0;
  }

  async findProcessing(): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { status: PaymentStatus.PROCESSING },
    });
  }

  async markConfirmed(id: string, blockNumber: number): Promise<Payment> {
    const payment = await this.findById(id);
    payment.status = PaymentStatus.CONFIRMED;
    payment.blockNumber = blockNumber;
    payment.confirmedAt = new Date();
    return this.paymentRepo.save(payment);
  }

  async markFailed(id: string): Promise<Payment> {
    const payment = await this.findById(id);
    payment.status = PaymentStatus.FAILED;
    return this.paymentRepo.save(payment);
  }
}
