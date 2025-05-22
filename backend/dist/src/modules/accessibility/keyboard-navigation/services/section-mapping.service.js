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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var SectionMappingService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SectionMappingService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const navigation_section_entity_1 = require('../entities/navigation-section.entity');
let SectionMappingService = (SectionMappingService_1 = class SectionMappingService {
  constructor(navigationSectionRepository) {
    this.navigationSectionRepository = navigationSectionRepository;
    this.logger = new common_1.Logger(SectionMappingService_1.name);
  }
  async createSection(sectionData) {
    this.logger.log(`Creating navigation section: ${sectionData.name}`);
    const section = this.navigationSectionRepository.create(sectionData);
    return this.navigationSectionRepository.save(section);
  }
  async updateSection(id, sectionData) {
    this.logger.log(`Updating navigation section: ${id}`);
    await this.navigationSectionRepository.update(id, sectionData);
    return this.navigationSectionRepository.findOne({ where: { id } });
  }
  async deleteSection(id) {
    this.logger.log(`Deleting navigation section: ${id}`);
    const result = await this.navigationSectionRepository.delete(id);
    return result.affected > 0;
  }
  async getSectionById(id) {
    return this.navigationSectionRepository.findOne({ where: { id } });
  }
  async getSectionsByRoute(route) {
    return this.navigationSectionRepository.find({
      where: { route, isActive: true },
      order: { priority: 'ASC' },
    });
  }
  async getAllSections() {
    return this.navigationSectionRepository.find({
      where: { isActive: true },
      order: { route: 'ASC', priority: 'ASC' },
    });
  }
  async getChildSections(parentId) {
    return this.navigationSectionRepository.find({
      where: { parentSectionId: parentId, isActive: true },
      order: { priority: 'ASC' },
    });
  }
  async initializeDefaultSections() {
    const defaultSections = [
      {
        name: 'Header',
        route: '*',
        selector: 'header',
        priority: 10,
        description: 'Main header navigation',
        ariaLabel: 'Header navigation',
      },
      {
        name: 'Main Navigation',
        route: '*',
        selector: 'nav.main-navigation',
        priority: 20,
        description: 'Main site navigation',
        ariaLabel: 'Main navigation',
      },
      {
        name: 'Main Content',
        route: '*',
        selector: 'main',
        priority: 30,
        description: 'Main content area',
        ariaLabel: 'Main content',
      },
      {
        name: 'Product Grid',
        route: '/products',
        selector: '.product-grid',
        childSelectors: ['.product-card'],
        priority: 40,
        description: 'Product listing grid',
        ariaLabel: 'Product grid',
      },
      {
        name: 'Product Details',
        route: '/products/:id',
        selector: '.product-details',
        priority: 40,
        description: 'Product details information',
        ariaLabel: 'Product details',
      },
      {
        name: 'Footer',
        route: '*',
        selector: 'footer',
        priority: 100,
        description: 'Footer navigation and information',
        ariaLabel: 'Footer navigation',
      },
    ];
    for (const section of defaultSections) {
      const existingSection = await this.navigationSectionRepository.findOne({
        where: { name: section.name, route: section.route },
      });
      if (!existingSection) {
        await this.createSection(section);
        this.logger.log(`Created default section: ${section.name} for route ${section.route}`);
      }
    }
  }
});
exports.SectionMappingService = SectionMappingService;
exports.SectionMappingService =
  SectionMappingService =
  SectionMappingService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(navigation_section_entity_1.NavigationSection)),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      SectionMappingService,
    );
//# sourceMappingURL=section-mapping.service.js.map
