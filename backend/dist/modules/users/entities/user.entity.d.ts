import { UserSegmentEntity } from './user-segment.entity';
export declare enum UserRole {
    USER = "USER",
    MERCHANT = "MERCHANT",
    ADMIN = "ADMIN"
}
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: UserRole;
    profileImage?: string;
    interests: string[];
    isEmailVerified: boolean;
    isMerchant: boolean;
    createdAt: Date;
    updatedAt: Date;
    segment: UserSegmentEntity;
    get fullName(): string;
}
