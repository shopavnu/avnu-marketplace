import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { MerchantAuthResolver } from './resolvers/merchant-auth.resolver';
import { UsersModule } from '../users/users.module';
import { MerchantsModule } from '../merchants/merchants.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MerchantAuthGuard } from './guards/merchant-auth.guard';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => MerchantsModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: `${configService.get<string>('JWT_EXPIRATION')}s` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    MerchantAuthResolver,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
    MerchantAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, MerchantAuthGuard],
})
export class AuthModule {}
