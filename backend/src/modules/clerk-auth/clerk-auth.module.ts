import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthService } from './clerk-auth.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ClerkAuthService, ClerkAuthGuard],
  exports: [ClerkAuthService, ClerkAuthGuard],
})
export class ClerkAuthModule {}
