import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClerkAuthService } from '../clerk-auth.service';
import { Reflector } from '@nestjs/core';
// Define public key constant here for now to avoid import issues
const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private clerkAuthService: ClerkAuthService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // If using ClerkExpressWithAuth middleware, the user will be attached to req.auth
    if (request.auth?.userId) {
      return true;
    }

    // For GraphQL, check the context for auth info
    if (context.getType() === ('graphql' as any)) {
      const gqlContext = context.getArgByIndex(2); // GraphQL context is the 3rd argument
      if (gqlContext?.auth?.userId) {
        return true;
      }
    }

    // No authenticated user found
    throw new UnauthorizedException('Authentication required');
  }
}
