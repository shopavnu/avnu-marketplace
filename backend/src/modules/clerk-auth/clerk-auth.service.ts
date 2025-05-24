import { Injectable } from '@nestjs/common';
import { Clerk, ClerkExpressWithAuth, ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthService {
  private clerk: ReturnType<typeof Clerk>;
  private verifyToken: any;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not defined in the environment variables');
    }

    this.clerk = Clerk({ secretKey });
    this.verifyToken = this.clerk.verifyToken;
  }

  /**
   * Get Clerk middleware to attach auth to requests
   * This doesn't deny requests without auth
   */
  getClerkMiddleware() {
    return ClerkExpressWithAuth();
  }

  /**
   * Get Clerk middleware that requires authentication
   * This denies requests without valid auth
   */
  getRequireAuthMiddleware() {
    return ClerkExpressRequireAuth();
  }

  /**
   * Verify a session token
   * @param token JWT token from Clerk
   * @returns The session claims if valid
   */
  async verifySessionToken(token: string) {
    try {
      const session = await this.verifyToken(token);
      return session;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user by ID from Clerk
   * @param userId Clerk user ID
   */
  async getUser(userId: string) {
    return this.clerk.users.getUser(userId);
  }
}
