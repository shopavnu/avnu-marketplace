import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { ClerkClient, createClerkClient, verifyToken as clerkVerifyToken } from '@clerk/backend';
import type { JwtPayload } from '@clerk/types';

@Injectable()
export class ClerkAuthService {
  private clerk: ClerkClient;
  private clerkJwtKey: string;
  private clerkSecretKey: string;

  constructor(private configService: ConfigService) {
    this.clerkJwtKey = this.configService.get<string>('CLERK_JWT_KEY');
    this.clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    if (!this.clerkJwtKey && !this.clerkSecretKey) {
      throw new Error(
        'Neither CLERK_JWT_KEY nor CLERK_SECRET_KEY is defined in the environment variables',
      );
    }

    // Initialize the Clerk backend client
    this.clerk = createClerkClient({ secretKey: this.clerkSecretKey });
  }

  /**
   * Get Clerk middleware to attach auth to requests
   * This doesn't deny requests without auth
   */
  getClerkMiddleware() {
    // ClerkExpressWithAuth is used to make auth information available but not enforce it
    return clerkMiddleware();
  }

  /**
   * Get Clerk middleware that requires authentication
   * This denies requests without valid auth
   */
  getRequireAuthMiddleware() {
    // ClerkExpressRequireAuth enforces authentication
    return requireAuth();
  }

  /**
   * Verify a session token using the backend client
   * @param token JWT token from Clerk
   * @returns The session claims if valid
   */
  async verifyToken(token: string): Promise<JwtPayload | null> {
    if (!this.clerkJwtKey && !this.clerkSecretKey) {
      console.error('Clerk JWT Key or Secret Key not provided. Token verification skipped.');
      return null;
    }

    try {
      const result = await clerkVerifyToken(token, {
        jwtKey: this.clerkJwtKey,
        secretKey: this.clerkSecretKey,
      });

      // result is Promise<SuccessfulJwtReturn<JwtPayload> | FailedJwtReturn> which resolves to:
      // { data: JwtPayload; errors?: never } | { data?: never; errors: TokenVerificationError[] }

      // Check for the 'errors' property to identify the FailedJwtReturn case
      if (
        'errors' in result &&
        result.errors &&
        Array.isArray(result.errors) &&
        result.errors.length > 0
      ) {
        console.error('Token verification failed (returned errors):', result.errors);
        return null;
      }

      // Check for the 'data' property to identify the SuccessfulJwtReturn case
      if ('data' in result && typeof result.data !== 'undefined') {
        // At this point, TypeScript should infer result as { data: JwtPayload; errors?: never }
        // and result.data as JwtPayload. If not, assert the type.
        return result.data as JwtPayload;
      }

      // Fallback: This case should ideally not be reached if the discriminated union is strictly one or the other.
      console.warn(
        'Token verification result was inconclusive (neither expected data nor errors structure found).',
        result,
      );
      return null;
    } catch (error) {
      // This catch block handles unexpected errors during the verification process itself (e.g., network issues if not networkless)
      console.error('Unexpected error during token verification process:', error);
      return null;
    }
  }

  /**
   * Get user by ID from Clerk using the backend client
   * @param userId Clerk user ID
   */
  async getUser(userId: string) {
    try {
      const user = await this.clerk.users.getUser(userId);
      return user;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error.message || error);
      return null;
    }
  }
}
