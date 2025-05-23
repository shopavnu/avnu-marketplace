import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MerchantRegisterDto } from './dto/merchant-register.dto';
import { MerchantService } from '../merchants/services/merchant.service';
import { UserRole } from '../users/entities/user.entity';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly merchantService;
    constructor(usersService: UsersService, jwtService: JwtService, merchantService: MerchantService);
    validateUser(email: string, password: string): Promise<User>;
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
            role: UserRole;
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
            role: UserRole;
            merchantId: string;
        };
    }>;
    registerMerchant(merchantRegisterDto: MerchantRegisterDto): Promise<{
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
            role: UserRole;
            merchantId: string;
        };
    }>;
    refreshToken(userId: string): Promise<{
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
            role: UserRole;
            merchantId: string;
        };
    }>;
    private getMerchantForUser;
    private generateToken;
}
