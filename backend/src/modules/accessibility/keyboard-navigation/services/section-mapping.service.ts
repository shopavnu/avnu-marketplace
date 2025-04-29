import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NavigationSection } from '../entities/navigation-section.entity';

@Injectable()
export class SectionMappingService {
  private readonly logger = new Logger(SectionMappingService.name);

  constructor(
    @InjectRepository(NavigationSection)
    private readonly navigationSectionRepository: Repository<NavigationSection>,
  ) {}

  /**
   * Create a new navigation section
   * @param sectionData Navigation section data
   * @returns Created navigation section
   */
  async createSection(sectionData: Partial<NavigationSection>): Promise<NavigationSection> {
    this.logger.log(`Creating navigation section: ${sectionData.name}`);
    const section = this.navigationSectionRepository.create(sectionData);
    return this.navigationSectionRepository.save(section);
  }

  /**
   * Update an existing navigation section
   * @param id Section ID
   * @param sectionData Updated section data
   * @returns Updated navigation section
   */
  async updateSection(
    id: string,
    sectionData: Partial<NavigationSection>,
  ): Promise<NavigationSection> {
    this.logger.log(`Updating navigation section: ${id}`);
    await this.navigationSectionRepository.update(id, sectionData);
    return this.navigationSectionRepository.findOne({ where: { id } });
  }

  /**
   * Delete a navigation section
   * @param id Section ID
   * @returns Boolean indicating success
   */
  async deleteSection(id: string): Promise<boolean> {
    this.logger.log(`Deleting navigation section: ${id}`);
    const result = await this.navigationSectionRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * Get a navigation section by ID
   * @param id Section ID
   * @returns Navigation section
   */
  async getSectionById(id: string): Promise<NavigationSection> {
    return this.navigationSectionRepository.findOne({ where: { id } });
  }

  /**
   * Get all navigation sections for a specific route
   * @param route Route path
   * @returns Array of navigation sections
   */
  async getSectionsByRoute(route: string): Promise<NavigationSection[]> {
    return this.navigationSectionRepository.find({
      where: { route, isActive: true },
      order: { priority: 'ASC' },
    });
  }

  /**
   * Get all active navigation sections
   * @returns Array of navigation sections
   */
  async getAllSections(): Promise<NavigationSection[]> {
    return this.navigationSectionRepository.find({
      where: { isActive: true },
      order: { route: 'ASC', priority: 'ASC' },
    });
  }

  /**
   * Get child sections for a parent section
   * @param parentId Parent section ID
   * @returns Array of child navigation sections
   */
  async getChildSections(parentId: string): Promise<NavigationSection[]> {
    return this.navigationSectionRepository.find({
      where: { parentSectionId: parentId, isActive: true },
      order: { priority: 'ASC' },
    });
  }

  /**
   * Initialize default navigation sections for common routes
   * This can be called during application bootstrap
   */
  async initializeDefaultSections(): Promise<void> {
    const defaultSections = [
      // Header navigation
      {
        name: 'Header',
        route: '*',
        selector: 'header',
        priority: 10,
        description: 'Main header navigation',
        ariaLabel: 'Header navigation',
      },
      // Main navigation
      {
        name: 'Main Navigation',
        route: '*',
        selector: 'nav.main-navigation',
        priority: 20,
        description: 'Main site navigation',
        ariaLabel: 'Main navigation',
      },
      // Main content
      {
        name: 'Main Content',
        route: '*',
        selector: 'main',
        priority: 30,
        description: 'Main content area',
        ariaLabel: 'Main content',
      },
      // Product grid on product listing pages
      {
        name: 'Product Grid',
        route: '/products',
        selector: '.product-grid',
        childSelectors: ['.product-card'],
        priority: 40,
        description: 'Product listing grid',
        ariaLabel: 'Product grid',
      },
      // Product details on product detail page
      {
        name: 'Product Details',
        route: '/products/:id',
        selector: '.product-details',
        priority: 40,
        description: 'Product details information',
        ariaLabel: 'Product details',
      },
      // Footer navigation
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
}
