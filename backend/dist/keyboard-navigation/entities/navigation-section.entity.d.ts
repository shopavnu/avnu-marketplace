export declare class NavigationSection {
  id: string;
  name: string;
  route: string;
  selector: string;
  childSelectors?: string[];
  priority: number;
  description?: string;
  ariaLabel?: string;
  parentSectionId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
