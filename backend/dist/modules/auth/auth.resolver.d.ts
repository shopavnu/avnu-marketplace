import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthResolver {
  private readonly authService;
  constructor(authService: AuthService);
  login(loginDto: LoginDto): Promise<{
    accessToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
      profileImage: string;
      isEmailVerified: boolean;
      isMerchant: boolean;
      role: import('../users/entities/user.entity').UserRole;
      merchantId: string;
    };
  }>;
  register(registerDto: RegisterDto): Promise<{
    accessToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
      profileImage: string;
      isEmailVerified: boolean;
      isMerchant: boolean;
      role: import('../users/entities/user.entity').UserRole;
      merchantId: string;
    };
  }>;
  profile(context: any): Promise<any>;
  refreshToken(context: any): Promise<{
    accessToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
      profileImage: string;
      isEmailVerified: boolean;
      isMerchant: boolean;
      role: import('../users/entities/user.entity').UserRole;
      merchantId: string;
    };
  }>;
}
