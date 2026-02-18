import { IsString, IsOptional, Matches } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  clientSecret: string;

  @IsString()
  @Matches(/^0x[0-9a-fA-F]{64}$/, { message: 'Invalid txHash format' })
  txHash: string;

  @IsOptional()
  @IsString()
  @Matches(/^0x[0-9a-fA-F]{40}$/, { message: 'Invalid address format' })
  senderAddress?: string;
}
