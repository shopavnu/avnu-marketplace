import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
  private readonly configService;
  private readonly usersService;
  constructor(configService: ConfigService, usersService: UsersService);
  validate(payload: JwtPayload): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: import('../../users').UserRole;
    isMerchant: boolean;
    merchantId: string;
  }>;
}
export {};
