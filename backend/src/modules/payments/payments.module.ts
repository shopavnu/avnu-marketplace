import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Payment entities will go here
    ]),
  ],
  providers: [
    // Payment services will go here
  ],
  controllers: [
    // Payment controllers will go here
  ],
  exports: [
    // Exported services will go here
  ],
})
export class PaymentsModule {}
