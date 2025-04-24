import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '../../users/enums/user-role.enum';

/**
 * Guard that ensures only admin users can access protected resources
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // For GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // Check if user exists and has admin role
    const user = request.user;

    if (!user) {
      return false;
    }

    return user.role === UserRole.ADMIN;
  }
}
