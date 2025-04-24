import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Shipping entities will go here
    ]),
  ],
  providers: [
    // Shipping services will go here
  ],
  controllers: [
    // Shipping controllers will go here
  ],
  exports: [
    // Exported services will go here
  ],
})
export class ShippingModule {}
