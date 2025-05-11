import { UserRole } from '../entities/user.entity';
export declare class CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  profileImage?: string;
  interests?: string[];
  role?: UserRole;
  isMerchant?: boolean;
}
