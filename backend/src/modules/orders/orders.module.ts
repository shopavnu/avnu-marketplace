import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Order entities will go here
    ]),
  ],
  providers: [
    // Order services will go here
  ],
  controllers: [
    // Order controllers will go here
  ],
  exports: [
    // Exported services will go here
  ],
})
export class OrdersModule {}
