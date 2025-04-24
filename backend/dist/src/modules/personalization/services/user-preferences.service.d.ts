import { Repository } from 'typeorm';
import { UserPreferences } from '../entities/user-preferences.entity';
import { CreateUserPreferencesDto } from '../dto/create-user-preferences.dto';
import { UpdateUserPreferencesDto } from '../dto/update-user-preferences.dto';
export declare class UserPreferencesService {
    private readonly userPreferencesRepository;
    private readonly logger;
    constructor(userPreferencesRepository: Repository<UserPreferences>);
    create(createUserPreferencesDto: CreateUserPreferencesDto): Promise<UserPreferences>;
    findByUserId(userId: string): Promise<UserPreferences>;
    update(userId: string, updateUserPreferencesDto: UpdateUserPreferencesDto): Promise<UserPreferences>;
    findOrCreate(userId: string): Promise<UserPreferences>;
    addFavoriteCategory(userId: string, category: string): Promise<UserPreferences>;
    removeFavoriteCategory(userId: string, category: string): Promise<UserPreferences>;
    addFavoriteValue(userId: string, value: string): Promise<UserPreferences>;
    removeFavoriteValue(userId: string, value: string): Promise<UserPreferences>;
    addFavoriteBrand(userId: string, brand: string): Promise<UserPreferences>;
    removeFavoriteBrand(userId: string, brand: string): Promise<UserPreferences>;
    setPriceSensitivity(userId: string, sensitivity: 'low' | 'medium' | 'high'): Promise<UserPreferences>;
    setPreferSustainable(userId: string, prefer: boolean): Promise<UserPreferences>;
    setPreferEthical(userId: string, prefer: boolean): Promise<UserPreferences>;
    setPreferLocalBrands(userId: string, prefer: boolean): Promise<UserPreferences>;
}
