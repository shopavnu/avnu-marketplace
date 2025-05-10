import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './session.service';
import { SessionInteractionType } from '../enums/session-interaction-type.enum';
export declare class AnonymousUserService {
    private readonly configService;
    private readonly sessionService;
    private readonly logger;
    private readonly cookieName;
    private readonly cookieMaxAge;
    private readonly cookieSecure;
    private readonly cookieSameSite;
    private readonly cookieDomain;
    constructor(configService: ConfigService, sessionService: SessionService);
    getOrCreateAnonymousId(req: Request, res: Response): string;
    trackInteraction(req: Request, res: Response, type: SessionInteractionType, data: Record<string, any>, durationMs?: number): Promise<void>;
    getPersonalizationWeights(req: Request, res: Response): Promise<Record<string, any>>;
    getRecentSearches(req: Request, res: Response, limit?: number): Promise<any[]>;
    getRecentlyViewedProducts(req: Request, res: Response, limit?: number): Promise<any[]>;
    getPreferredCategories(req: Request, res: Response): Promise<Record<string, number>>;
    getPreferredBrands(req: Request, res: Response): Promise<Record<string, number>>;
    clearAnonymousUserData(req: Request, res: Response): void;
}
