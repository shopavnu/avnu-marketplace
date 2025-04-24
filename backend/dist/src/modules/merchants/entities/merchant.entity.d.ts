import { User } from '../../users/entities/user.entity';
export declare class Merchant {
    id: string;
    name: string;
    description: string;
    logo: string;
    website: string;
    values: string[];
    categories: string[];
    latitude: number;
    longitude: number;
    rating: number;
    reviewCount: number;
    productCount: number;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    popularity: number;
    userId: string;
    user: User;
}
