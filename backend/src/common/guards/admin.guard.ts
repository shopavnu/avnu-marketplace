import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // For GraphQL context
    if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const { req } = gqlContext.getContext();
      return this.validateRequest(req);
    }

    // For REST context
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any): boolean {
    // Check if user is authenticated and has admin role
    // This implementation depends on your authentication strategy
    if (!request.user) {
      return false;
    }

    // Check if user has admin role
    return request.user.roles && request.user.roles.includes('admin');
  }
}
