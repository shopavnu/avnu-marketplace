import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isMerchant: boolean;
  merchantId?: string; // Optional merchant ID for merchant users
  iat?: number;
  exp?: number;
}
