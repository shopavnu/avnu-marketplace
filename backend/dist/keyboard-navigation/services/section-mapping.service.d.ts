import { Repository } from 'typeorm';
import { NavigationSection } from '../entities/navigation-section.entity';
export declare class SectionMappingService {
  private readonly navigationSectionRepository;
  private readonly logger;
  constructor(navigationSectionRepository: Repository<NavigationSection>);
  createSection(sectionData: Partial<NavigationSection>): Promise<NavigationSection>;
  updateSection(id: string, sectionData: Partial<NavigationSection>): Promise<NavigationSection>;
  deleteSection(id: string): Promise<boolean>;
  getSectionById(id: string): Promise<NavigationSection>;
  getSectionsByRoute(route: string): Promise<NavigationSection[]>;
  getAllSections(): Promise<NavigationSection[]>;
  getChildSections(parentId: string): Promise<NavigationSection[]>;
  initializeDefaultSections(): Promise<void>;
}
