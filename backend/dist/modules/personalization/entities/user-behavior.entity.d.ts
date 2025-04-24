import { User } from '../../users/entities/user.entity';
export declare enum BehaviorType {
    VIEW = "view",
    SEARCH = "search",
    FAVORITE = "favorite",
    ADD_TO_CART = "add_to_cart",
    PURCHASE = "purchase"
}
export declare class UserBehavior {
    id: string;
    userId: string;
    user: User;
    entityId: string;
    entityType: 'product' | 'category' | 'brand' | 'merchant' | 'search';
    behaviorType: BehaviorType;
    count: number;
    metadata: string;
    createdAt: Date;
    lastInteractionAt: Date;
}
