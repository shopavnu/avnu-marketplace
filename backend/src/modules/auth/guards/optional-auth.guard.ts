import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * OptionalAuthGuard
 * 
 * This guard allows requests to proceed even if authentication fails.
 * It's useful for endpoints that can work with both authenticated and unauthenticated users.
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to prevent throwing an error if authentication fails
  handleRequest(err: any, user: any) {
    // Return the user if authentication was successful, or null if it failed
    return user || null;
  }

  // For GraphQL context
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
