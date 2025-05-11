// @ts-strict-mode: enabled
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard to check if the user has merchant role
 */
@Injectable()
export class MerchantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if user exists and has the merchant role
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check if the user has the merchant role
    const hasMerchantRole =
      user.roles && Array.isArray(user.roles) && user.roles.includes('merchant');

    // Check if the user has a merchantId
    const hasMerchantId = !!user.merchantId;

    return hasMerchantRole && hasMerchantId;
  }
}
