import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InitiateCheckoutResponseDto {
  @ApiProperty({
    description: 'The ID of the newly created order.',
    example: 'clx123abc456def789',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'The client secret for the Stripe PaymentIntent.',
    example: 'pi_3abc123def456ghi_secret_jkl789mno',
  })
  @IsString()
  clientSecret: string;

  @ApiProperty({
    description: 'The ID of the Stripe PaymentIntent.',
    example: 'pi_3abc123def456ghi',
  })
  @IsString()
  paymentIntentId: string;
}
