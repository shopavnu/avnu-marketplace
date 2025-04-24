import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MerchantAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is public, allow access
    if (isPublic) {
      return true;
    }

    // First, check if the user is authenticated using the JWT guard
    try {
      const isAuthenticated = await super.canActivate(context);
      if (!isAuthenticated) {
        return false;
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    // Get the request object (works for both HTTP and GraphQL)
    const request = this.getRequest(context);
    const user = request.user;

    // Check if the user exists and has the MERCHANT role or is an ADMIN
    if (!user) {
      return false;
    }

    // Admins always have access
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Check if user is a merchant
    if (user.role !== UserRole.MERCHANT) {
      throw new ForbiddenException('You must be a merchant to access this resource');
    }

    // Check if merchantId is present in the token
    if (!user.merchantId) {
      throw new ForbiddenException('No merchant account associated with this user');
    }

    // For GraphQL requests, check if the merchantId in the args matches the user's merchantId
    if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const args = gqlContext.getArgs();

      // If there's a merchantId in the args, make sure it matches the user's merchantId
      if (args.merchantId && args.merchantId !== user.merchantId) {
        throw new ForbiddenException('You do not have access to this merchant account');
      }
    }

    return true;
  }

  // Implement getRequest method as public to match the interface
  public getRequest(context: ExecutionContext) {
    if (context.getType().toString() === 'http') {
      return context.switchToHttp().getRequest();
    }

    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req;
  }
}
