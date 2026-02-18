import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from '../../entities';
import { SecretKeyGuard } from '../../guards/secret-key.guard';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { generateWebhookSecret } from '../../utils/crypto';

@Controller('webhooks')
@UseGuards(SecretKeyGuard)
export class WebhooksController {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepo: Repository<Webhook>,
  ) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateWebhookDto) {
    const secret = generateWebhookSecret();
    const webhook = this.webhookRepo.create({
      merchantId: req.merchant.id,
      url: dto.url,
      secret,
      events: dto.events,
    });
    const saved = await this.webhookRepo.save(webhook);
    return { ...saved, secret };
  }

  @Get()
  async list(@Req() req) {
    return this.webhookRepo.find({
      where: { merchantId: req.merchant.id, isActive: true },
      select: ['id', 'url', 'events', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    const webhook = await this.webhookRepo.findOne({
      where: { id, merchantId: req.merchant.id },
    });
    if (!webhook) throw new NotFoundException();
    webhook.isActive = false;
    await this.webhookRepo.save(webhook);
    return { deleted: true };
  }
}
