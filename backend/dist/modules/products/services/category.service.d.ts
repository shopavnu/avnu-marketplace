import { EventEmitter2 } from '@nestjs/event-emitter';
interface Category {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    level: number;
    path: string[];
    attributes?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class CategoryService {
    private readonly eventEmitter;
    private categories;
    constructor(eventEmitter: EventEmitter2);
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    findByIds(ids: string[]): Promise<Category[]>;
    findChildren(parentId: string): Promise<Category[]>;
    findByLevel(level: number): Promise<Category[]>;
    findByPath(path: string[]): Promise<Category[]>;
    findRootCategories(): Promise<Category[]>;
    getCategoryHierarchy(): Promise<any[]>;
    getCategoryAttributes(categoryId: string): Promise<string[]>;
    getCategoryPath(categoryId: string): Promise<string[]>;
    getCategoryBreadcrumbs(categoryId: string): Promise<{
        id: string;
        name: string;
    }[]>;
}
export {};
