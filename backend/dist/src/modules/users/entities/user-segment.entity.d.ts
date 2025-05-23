import { User } from './user.entity';
export declare class UserSegmentEntity {
    id: string;
    name: string;
    description: string;
    userCount: number;
    users: User[];
    createdAt: Date;
    updatedAt: Date;
}
