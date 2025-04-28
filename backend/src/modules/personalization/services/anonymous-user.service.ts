import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { SessionService, SessionInteractionType } from './session.service';

/**
 * Service for managing anonymous user identification and preferences
 * through cookies and local storage integration
 */
@Injectable()
export class AnonymousUserService {
  private readonly logger = new Logger(AnonymousUserService.name);
  private readonly cookieName: string;
  private readonly cookieMaxAge: number; // in milliseconds
  private readonly cookieSecure: boolean;
  private readonly cookieSameSite: 'strict' | 'lax' | 'none';
  private readonly cookieDomain: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    // Load configuration
    this.cookieName = this.configService.get<string>(
      'ANONYMOUS_USER_COOKIE_NAME',
      'avnu_anonymous_id',
    );
    this.cookieMaxAge = this.configService.get<number>(
      'ANONYMOUS_USER_COOKIE_MAX_AGE',
      30 * 24 * 60 * 60 * 1000,
    ); // 30 days
    this.cookieSecure = this.configService.get<boolean>(
      'COOKIE_SECURE',
      process.env.NODE_ENV === 'production',
    );
    this.cookieSameSite = this.configService.get<'strict' | 'lax' | 'none'>(
      'COOKIE_SAME_SITE',
      'lax',
    );
    this.cookieDomain = this.configService.get<string>('COOKIE_DOMAIN', '');
  }

  /**
   * Get or create an anonymous user ID from cookies
   * @param req Express request
   * @param res Express response
   * @returns Anonymous user ID
   */
  getOrCreateAnonymousId(req: Request, res: Response): string {
    try {
      // Check if anonymous ID already exists in cookies
      const existingId = req.cookies[this.cookieName];

      if (existingId) {
        return existingId;
      }

      // Create new anonymous ID
      const newId = uuidv4();

      // Set cookie
      res.cookie(this.cookieName, newId, {
        maxAge: this.cookieMaxAge,
        httpOnly: true,
        secure: this.cookieSecure,
        sameSite: this.cookieSameSite,
        domain: this.cookieDomain || undefined,
        path: '/',
      });

      this.logger.debug(`Created new anonymous user ID: ${newId}`);
      return newId;
    } catch (error) {
      this.logger.error(`Failed to get or create anonymous ID: ${error.message}`);
      // Return a temporary ID that won't be persisted
      return `temp-${uuidv4()}`;
    }
  }

  /**
   * Track an interaction for an anonymous user
   * @param req Express request
   * @param res Express response
   * @param type Interaction type
   * @param data Interaction data
   * @param durationMs Optional duration in milliseconds
   */
  async trackInteraction(
    req: Request,
    res: Response,
    type: SessionInteractionType,
    data: Record<string, any>,
    durationMs?: number,
  ): Promise<void> {
    const anonymousId = this.getOrCreateAnonymousId(req, res);

    // Use the anonymous ID as the session ID
    await this.sessionService.trackInteraction(anonymousId, type, data, durationMs);
  }

  /**
   * Get personalization weights for an anonymous user
   * @param req Express request
   * @param res Express response
   * @returns Personalization weights
   */
  async getPersonalizationWeights(req: Request, res: Response): Promise<Record<string, any>> {
    const anonymousId = this.getOrCreateAnonymousId(req, res);

    // Calculate weights based on session interactions
    return this.sessionService.calculateSessionWeights(anonymousId);
  }

  /**
   * Get recent search history for an anonymous user
   * @param req Express request
   * @param res Express response
   * @param limit Maximum number of searches to return
   * @returns Recent search interactions
   */
  async getRecentSearches(req: Request, res: Response, limit: number = 5): Promise<any[]> {
    const anonymousId = this.getOrCreateAnonymousId(req, res);

    // Get recent search interactions
    const searchInteractions = await this.sessionService.getRecentInteractions(
      anonymousId,
      SessionInteractionType.SEARCH,
      limit,
    );

    // Extract search queries and timestamps
    return searchInteractions.map(interaction => ({
      query: interaction.data.query,
      timestamp: interaction.timestamp,
      resultCount: interaction.data.resultCount,
    }));
  }

  /**
   * Get recently viewed products for an anonymous user
   * @param req Express request
   * @param res Express response
   * @param limit Maximum number of products to return
   * @returns Recently viewed product IDs with timestamps
   */
  async getRecentlyViewedProducts(req: Request, res: Response, limit: number = 10): Promise<any[]> {
    const anonymousId = this.getOrCreateAnonymousId(req, res);

    // Get recent product view interactions
    const viewInteractions = await this.sessionService.getRecentInteractions(
      anonymousId,
      SessionInteractionType.PRODUCT_VIEW,
      limit,
    );

    // Extract product IDs and timestamps
    return viewInteractions.map(interaction => ({
      productId: interaction.data.productId,
      timestamp: interaction.timestamp,
      viewTimeSeconds: (interaction.data.viewTimeMs || 0) / 1000,
    }));
  }

  /**
   * Get preferred categories for an anonymous user
   * @param req Express request
   * @param res Express response
   * @returns Category preferences with weights
   */
  async getPreferredCategories(req: Request, res: Response): Promise<Record<string, number>> {
    const weights = await this.getPersonalizationWeights(req, res);
    return weights.categories || {};
  }

  /**
   * Get preferred brands for an anonymous user
   * @param req Express request
   * @param res Express response
   * @returns Brand preferences with weights
   */
  async getPreferredBrands(req: Request, res: Response): Promise<Record<string, number>> {
    const weights = await this.getPersonalizationWeights(req, res);
    return weights.brands || {};
  }

  /**
   * Clear anonymous user data
   * @param req Express request
   * @param res Express response
   */
  clearAnonymousUserData(req: Request, res: Response): void {
    // Clear the cookie
    res.clearCookie(this.cookieName, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      domain: this.cookieDomain || undefined,
      path: '/',
    });

    this.logger.debug('Cleared anonymous user data');
  }
}
