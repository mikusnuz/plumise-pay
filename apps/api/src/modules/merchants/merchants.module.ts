import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant])],
  exports: [TypeOrmModule],
})
export class MerchantsModule {}
