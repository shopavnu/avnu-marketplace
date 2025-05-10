import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectionIdDto {
  @ApiProperty({
    description: 'The ID of the merchant platform connection',
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
  connectionId: string;
}

export class MerchantIdDto {
  @ApiProperty({
    description: 'The ID of the merchant',
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
  merchantId: string;
}
