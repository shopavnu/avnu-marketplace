import { User } from '../../users/entities/user.entity';
export declare class UserPreferences {
  id: string;
  userId: string;
  user: User;
  favoriteCategories: string[];
  favoriteValues: string[];
  favoriteBrands: string[];
  priceSensitivity: 'low' | 'medium' | 'high';
  preferSustainable: boolean;
  preferEthical: boolean;
  preferLocalBrands: boolean;
  preferredSizes: string[];
  preferredColors: string[];
  preferredMaterials: string[];
  createdAt: Date;
  updatedAt: Date;
}
