import { UserRole } from '../../users/entities/user.entity';
declare class UserInfo {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profileImage?: string;
    isEmailVerified: boolean;
    isMerchant: boolean;
    role: UserRole;
    merchantId?: string;
}
export declare class AuthResponse {
    accessToken: string;
    user: UserInfo;
}
export {};
