import { BrokerType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl, Matches, MinLength } from 'class-validator';

export class CreateBrokerDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must use lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsUrl({ require_protocol: true })
  logo_url: string;

  @IsUrl({ require_protocol: true })
  website: string;

  @IsEnum(BrokerType)
  broker_type: BrokerType;
}

export class BrokerQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BrokerType)
  type?: BrokerType;
}
