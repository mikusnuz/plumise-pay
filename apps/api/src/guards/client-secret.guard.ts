import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Payment, PaymentStatus } from '../entities';

@Injectable()
export class ClientSecretGuard implements CanActivate {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const clientSecret =
      req.query?.clientSecret || req.body?.clientSecret;

    if (!clientSecret) {
      throw new UnauthorizedException('Missing clientSecret');
    }

    const payment = await this.paymentRepo.findOne({
      where: {
        clientSecret,
        status: Not(PaymentStatus.EXPIRED),
      },
      relations: ['merchant'],
    });

    if (!payment) {
      throw new UnauthorizedException('Invalid or expired clientSecret');
    }

    req.payment = payment;
    req.merchant = payment.merchant;

    return true;
  }
}
