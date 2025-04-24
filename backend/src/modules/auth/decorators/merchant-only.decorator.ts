import { applyDecorators, UseGuards } from '@nestjs/common';
import { MerchantAuthGuard } from '../guards/merchant-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '../../users/entities/user.entity';

/**
 * Decorator that combines authentication and role checks for merchant-only routes
 * Also allows admins to access merchant routes
 */
export function MerchantOnly() {
  return applyDecorators(
    UseGuards(MerchantAuthGuard, RolesGuard),
    Roles(UserRole.MERCHANT, UserRole.ADMIN),
  );
}
