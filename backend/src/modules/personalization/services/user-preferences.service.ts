import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreferences } from '../entities/user-preferences.entity';
import { CreateUserPreferencesDto } from '../dto/create-user-preferences.dto';
import { UpdateUserPreferencesDto } from '../dto/update-user-preferences.dto';

@Injectable()
export class UserPreferencesService {
  private readonly logger = new Logger(UserPreferencesService.name);

  constructor(
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepository: Repository<UserPreferences>,
  ) {}

  /**
   * Create user preferences
   * @param createUserPreferencesDto User preferences data
   */
  async create(createUserPreferencesDto: CreateUserPreferencesDto): Promise<UserPreferences> {
    try {
      // Check if preferences already exist for the user
      const existingPreferences = await this.userPreferencesRepository.findOne({
        where: { userId: createUserPreferencesDto.userId },
      });

      if (existingPreferences) {
        throw new Error(`Preferences already exist for user ${createUserPreferencesDto.userId}`);
      }

      const userPreferences = this.userPreferencesRepository.create(createUserPreferencesDto);
      return this.userPreferencesRepository.save(userPreferences);
    } catch (error) {
      this.logger.error(`Failed to create user preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find user preferences by user ID
   * @param userId User ID
   */
  async findByUserId(userId: string): Promise<UserPreferences> {
    try {
      const userPreferences = await this.userPreferencesRepository.findOne({
        where: { userId },
      });

      if (!userPreferences) {
        throw new NotFoundException(`User preferences not found for user ${userId}`);
      }

      return userPreferences;
    } catch (error) {
      this.logger.error(`Failed to find user preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user preferences
   * @param userId User ID
   * @param updateUserPreferencesDto Updated preferences data
   */
  async update(
    userId: string,
    updateUserPreferencesDto: UpdateUserPreferencesDto,
  ): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findByUserId(userId);

      const updatedPreferences = this.userPreferencesRepository.merge(
        userPreferences,
        updateUserPreferencesDto,
      );

      return this.userPreferencesRepository.save(updatedPreferences);
    } catch (error) {
      this.logger.error(`Failed to update user preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find or create user preferences
   * @param userId User ID
   */
  async findOrCreate(userId: string): Promise<UserPreferences> {
    try {
      // Try to find existing preferences
      try {
        return await this.findByUserId(userId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          // Create new preferences if not found
          return this.create({ userId });
        }
        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to find or create user preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add favorite category
   * @param userId User ID
   * @param category Category to add
   */
  async addFavoriteCategory(userId: string, category: string): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      // Initialize array if null
      if (!userPreferences.favoriteCategories) {
        userPreferences.favoriteCategories = [];
      }

      // Add category if not already in the list
      if (!userPreferences.favoriteCategories.includes(category)) {
        userPreferences.favoriteCategories.push(category);
        return this.userPreferencesRepository.save(userPreferences);
      }

      return userPreferences;
    } catch (error) {
      this.logger.error(`Failed to add favorite category: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove favorite category
   * @param userId User ID
   * @param category Category to remove
   */
  async removeFavoriteCategory(userId: string, category: string): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      // Remove category if it exists
      if (userPreferences.favoriteCategories) {
        userPreferences.favoriteCategories = userPreferences.favoriteCategories.filter(
          c => c !== category,
        );
        return this.userPreferencesRepository.save(userPreferences);
      }

      return userPreferences;
    } catch (error) {
      this.logger.error(`Failed to remove favorite category: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add favorite value
   * @param userId User ID
   * @param value Value to add
   */
  async addFavoriteValue(userId: string, value: string): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      // Initialize array if null
      if (!userPreferences.favoriteValues) {
        userPreferences.favoriteValues = [];
      }

      // Add value if not already in the list
      if (!userPreferences.favoriteValues.includes(value)) {
        userPreferences.favoriteValues.push(value);
        return this.userPreferencesRepository.save(userPreferences);
      }

      return userPreferences;
    } catch (error) {
      this.logger.error(`Failed to add favorite value: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove favorite value
   * @param userId User ID
   * @param value Value to remove
   */
  async removeFavoriteValue(userId: string, value: string): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      // Remove value if it exists
      if (userPreferences.favoriteValues) {
        userPreferences.favoriteValues = userPreferences.favoriteValues.filter(v => v !== value);
        return this.userPreferencesRepository.save(userPreferences);
      }

      return userPreferences;
    } catch (error) {
      this.logger.error(`Failed to remove favorite value: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add favorite brand
   * @param userId User ID
   * @param brand Brand to add
   */
  async addFavoriteBrand(userId: string, brand: string): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      // Initialize array if null
      if (!userPreferences.favoriteBrands) {
        userPreferences.favoriteBrands = [];
      }

      // Add brand if not already in the list
      if (!userPreferences.favoriteBrands.includes(brand)) {
        userPreferences.favoriteBrands.push(brand);
        return this.userPreferencesRepository.save(userPreferences);
      }

      return userPreferences;
    } catch (error) {
      this.logger.error(`Failed to add favorite brand: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove favorite brand
   * @param userId User ID
   * @param brand Brand to remove
   */
  async removeFavoriteBrand(userId: string, brand: string): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      // Remove brand if it exists
      if (userPreferences.favoriteBrands) {
        userPreferences.favoriteBrands = userPreferences.favoriteBrands.filter(b => b !== brand);
        return this.userPreferencesRepository.save(userPreferences);
      }

      return userPreferences;
    } catch (error) {
      this.logger.error(`Failed to remove favorite brand: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set price sensitivity
   * @param userId User ID
   * @param sensitivity Price sensitivity
   */
  async setPriceSensitivity(
    userId: string,
    sensitivity: 'low' | 'medium' | 'high',
  ): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      userPreferences.priceSensitivity = sensitivity;
      return this.userPreferencesRepository.save(userPreferences);
    } catch (error) {
      this.logger.error(`Failed to set price sensitivity: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set sustainability preference
   * @param userId User ID
   * @param prefer Whether to prefer sustainable products
   */
  async setPreferSustainable(userId: string, prefer: boolean): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      userPreferences.preferSustainable = prefer;
      return this.userPreferencesRepository.save(userPreferences);
    } catch (error) {
      this.logger.error(`Failed to set sustainability preference: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set ethical preference
   * @param userId User ID
   * @param prefer Whether to prefer ethical products
   */
  async setPreferEthical(userId: string, prefer: boolean): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      userPreferences.preferEthical = prefer;
      return this.userPreferencesRepository.save(userPreferences);
    } catch (error) {
      this.logger.error(`Failed to set ethical preference: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set local brands preference
   * @param userId User ID
   * @param prefer Whether to prefer local brands
   */
  async setPreferLocalBrands(userId: string, prefer: boolean): Promise<UserPreferences> {
    try {
      const userPreferences = await this.findOrCreate(userId);

      userPreferences.preferLocalBrands = prefer;
      return this.userPreferencesRepository.save(userPreferences);
    } catch (error) {
      this.logger.error(`Failed to set local brands preference: ${error.message}`);
      throw error;
    }
  }
}
