import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
  IsObject,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  @MaxLength(42)
  currency?: string;

  @IsString()
  @Matches(/^0x[0-9a-fA-F]{40}$/, { message: 'Invalid address format' })
  recipientAddress: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  orderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  expiresInMinutes?: number;
}
