import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Since we don't have a Category entity yet, let's create a simple interface
// In a real implementation, you would have a proper entity
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

@Injectable()
export class CategoryService {
  // This is a mock implementation
  // In a real application, you would inject a repository for the Category entity
  private categories: Category[] = [
    {
      id: 'cat-001',
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      level: 1,
      path: ['Electronics'],
      attributes: ['Brand', 'Model', 'Color', 'Warranty'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-002',
      name: 'Smartphones',
      description: 'Mobile phones and accessories',
      parentId: 'cat-001',
      level: 2,
      path: ['Electronics', 'Smartphones'],
      attributes: ['Brand', 'Model', 'Storage', 'Color', 'Camera'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-003',
      name: 'Laptops',
      description: 'Notebook computers',
      parentId: 'cat-001',
      level: 2,
      path: ['Electronics', 'Laptops'],
      attributes: ['Brand', 'Processor', 'RAM', 'Storage', 'Screen Size'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-004',
      name: 'Clothing',
      description: 'Apparel and fashion items',
      level: 1,
      path: ['Clothing'],
      attributes: ['Brand', 'Size', 'Color', 'Material'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-005',
      name: "Men's Clothing",
      description: 'Clothing for men',
      parentId: 'cat-004',
      level: 2,
      path: ['Clothing', "Men's Clothing"],
      attributes: ['Brand', 'Size', 'Color', 'Material', 'Style'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-006',
      name: "Women's Clothing",
      description: 'Clothing for women',
      parentId: 'cat-004',
      level: 2,
      path: ['Clothing', "Women's Clothing"],
      attributes: ['Brand', 'Size', 'Color', 'Material', 'Style'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-007',
      name: 'Home & Kitchen',
      description: 'Home goods and kitchen appliances',
      level: 1,
      path: ['Home & Kitchen'],
      attributes: ['Brand', 'Material', 'Color', 'Size'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-008',
      name: 'Furniture',
      description: 'Furniture for home and office',
      parentId: 'cat-007',
      level: 2,
      path: ['Home & Kitchen', 'Furniture'],
      attributes: ['Brand', 'Material', 'Color', 'Style', 'Dimensions'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-009',
      name: 'Kitchen Appliances',
      description: 'Appliances for the kitchen',
      parentId: 'cat-007',
      level: 2,
      path: ['Home & Kitchen', 'Kitchen Appliances'],
      attributes: ['Brand', 'Power', 'Color', 'Features'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat-010',
      name: 'Beauty & Personal Care',
      description: 'Beauty products and personal care items',
      level: 1,
      path: ['Beauty & Personal Care'],
      attributes: ['Brand', 'Skin Type', 'Concerns', 'Ingredients'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async findAll(): Promise<Category[]> {
    return this.categories;
  }

  async findOne(id: string): Promise<Category> {
    const category = this.categories.find(cat => cat.id === id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    if (!ids.length) return [];

    return this.categories.filter(cat => ids.includes(cat.id));
  }

  async findChildren(parentId: string): Promise<Category[]> {
    return this.categories.filter(cat => cat.parentId === parentId);
  }

  async findByLevel(level: number): Promise<Category[]> {
    return this.categories.filter(cat => cat.level === level);
  }

  async findByPath(path: string[]): Promise<Category[]> {
    return this.categories.filter(
      cat =>
        path.length === cat.path.length && path.every((item, index) => item === cat.path[index]),
    );
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categories.filter(cat => cat.level === 1);
  }

  async getCategoryHierarchy(): Promise<any[]> {
    // Get root categories
    const rootCategories = await this.findRootCategories();

    // Build hierarchy
    const hierarchy = [];

    for (const rootCategory of rootCategories) {
      const children = await this.findChildren(rootCategory.id);

      hierarchy.push({
        ...rootCategory,
        children: children.map(child => ({
          ...child,
          children: [],
        })),
      });
    }

    return hierarchy;
  }

  async getCategoryAttributes(categoryId: string): Promise<string[]> {
    const category = await this.findOne(categoryId);
    return category.attributes || [];
  }

  async getCategoryPath(categoryId: string): Promise<string[]> {
    const category = await this.findOne(categoryId);
    return category.path;
  }

  async getCategoryBreadcrumbs(categoryId: string): Promise<{ id: string; name: string }[]> {
    const category = await this.findOne(categoryId);

    const breadcrumbs = [];
    const currentPath = [];

    for (const pathSegment of category.path) {
      currentPath.push(pathSegment);

      const matchingCategories = await this.findByPath(currentPath);

      if (matchingCategories.length > 0) {
        const matchingCategory = matchingCategories[0];
        breadcrumbs.push({
          id: matchingCategory.id,
          name: matchingCategory.name,
        });
      }
    }

    return breadcrumbs;
  }
}
