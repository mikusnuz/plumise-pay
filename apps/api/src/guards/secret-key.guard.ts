import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ApiKey, ApiKeyType } from '../entities';
import { hmacSha256Hex, constantTimeEqualHex } from '../utils/crypto';

@Injectable()
export class SecretKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const rawKey = auth.slice(7);
    if (!rawKey.startsWith('sk_live_')) {
      throw new UnauthorizedException('Invalid key format');
    }

    const hmacSecret = process.env.HMAC_SECRET || 'plumise-pay-hmac-secret-v1';
    const hash = hmacSha256Hex(hmacSecret, rawKey);

    const keys = await this.apiKeyRepo.find({
      where: { type: ApiKeyType.SECRET, revokedAt: IsNull() },
      relations: ['merchant'],
    });

    const matched = keys.find((k) => constantTimeEqualHex(k.keyHash, hash));
    if (!matched) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!matched.merchant?.isActive) {
      throw new UnauthorizedException('Merchant inactive');
    }

    req.merchant = matched.merchant;
    req.apiKey = matched;

    matched.lastUsedAt = new Date();
    await this.apiKeyRepo.save(matched);

    return true;
  }
}
