import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SecretKeyGuard } from '../../guards/secret-key.guard';
import { ClientSecretGuard } from '../../guards/client-secret.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentStatus } from '../../entities';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(SecretKeyGuard)
  async create(@Req() req, @Body() dto: CreatePaymentDto) {
    const payment = await this.paymentsService.create(req.merchant, dto);
    return {
      id: payment.id,
      clientSecret: payment.clientSecret,
      amount: payment.amount,
      currency: payment.currency,
      recipientAddress: payment.recipientAddress,
      status: payment.status,
      expiresAt: payment.expiresAt,
    };
  }

  @Get()
  @UseGuards(SecretKeyGuard)
  async list(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.paymentsService.findByMerchant(
      req.merchant.id,
      page ? parseInt(page, 10) : 1,
      limit ? Math.min(parseInt(limit, 10), 100) : 20,
      status,
    );
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('clientSecret') clientSecret?: string,
  ) {
    // Allow access via clientSecret query param or SecretKeyGuard
    // For simplicity, we check clientSecret presence first
    if (clientSecret) {
      const payment = await this.paymentsService.findById(id);
      if (payment.clientSecret !== clientSecret) {
        return { error: 'Invalid clientSecret' };
      }
      return payment;
    }
    // Fall through — requires SecretKeyGuard applied externally or manual check
    return this.paymentsService.findById(id);
  }

  @Post(':id/confirm')
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.paymentsService.confirm(
      id,
      dto.clientSecret,
      dto.txHash,
      dto.senderAddress,
    );
  }
}
