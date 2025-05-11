'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.CategoryService = void 0;
const common_1 = require('@nestjs/common');
const event_emitter_1 = require('@nestjs/event-emitter');
let CategoryService = class CategoryService {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.categories = [
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
  }
  async findAll() {
    return this.categories;
  }
  async findOne(id) {
    const category = this.categories.find(cat => cat.id === id);
    if (!category) {
      throw new common_1.NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }
  async findByIds(ids) {
    if (!ids.length) return [];
    return this.categories.filter(cat => ids.includes(cat.id));
  }
  async findChildren(parentId) {
    return this.categories.filter(cat => cat.parentId === parentId);
  }
  async findByLevel(level) {
    return this.categories.filter(cat => cat.level === level);
  }
  async findByPath(path) {
    return this.categories.filter(
      cat =>
        path.length === cat.path.length && path.every((item, index) => item === cat.path[index]),
    );
  }
  async findRootCategories() {
    return this.categories.filter(cat => cat.level === 1);
  }
  async getCategoryHierarchy() {
    const rootCategories = await this.findRootCategories();
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
  async getCategoryAttributes(categoryId) {
    const category = await this.findOne(categoryId);
    return category.attributes || [];
  }
  async getCategoryPath(categoryId) {
    const category = await this.findOne(categoryId);
    return category.path;
  }
  async getCategoryBreadcrumbs(categoryId) {
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
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [event_emitter_1.EventEmitter2])],
  CategoryService,
);
//# sourceMappingURL=category.service.js.map
