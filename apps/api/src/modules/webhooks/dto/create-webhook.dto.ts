import { IsString, IsArray, IsUrl, ArrayNotEmpty } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  @IsUrl({ require_tld: false })
  url: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  events: string[];
}
