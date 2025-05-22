export declare class Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  parentId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
