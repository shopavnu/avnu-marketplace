import { AuthService } from '../auth.service';
import { MerchantRegisterDto } from '../dto/merchant-register.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '../../users/entities/user.entity';
export declare class MerchantAuthResolver {
    private readonly authService;
    constructor(authService: AuthService);
    merchantRegister(merchantRegisterDto: MerchantRegisterDto): Promise<{
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
            role: import("../../users/entities/user.entity").UserRole;
            merchantId: string;
        };
    }>;
    merchantLogin(loginDto: LoginDto): Promise<{
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
            role: import("../../users/entities/user.entity").UserRole;
            merchantId: string;
        };
    }>;
    merchantRefreshToken(user: User): Promise<{
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
            role: import("../../users/entities/user.entity").UserRole;
            merchantId: string;
        };
    }>;
}
