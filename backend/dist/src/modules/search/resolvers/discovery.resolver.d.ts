import { DiscoverySearchService } from '../services/discovery-search.service';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { User } from '../../users/entities/user.entity';
export declare class DiscoveryResolver {
    private readonly discoverySearchService;
    constructor(discoverySearchService: DiscoverySearchService);
    discoveryHomepage(user: User | null, sessionId?: string, options?: SearchOptionsInput): Promise<any>;
}
