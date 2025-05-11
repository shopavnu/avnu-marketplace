'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MerchantOnly = MerchantOnly;
const common_1 = require('@nestjs/common');
const merchant_auth_guard_1 = require('../guards/merchant-auth.guard');
const roles_decorator_1 = require('./roles.decorator');
const roles_guard_1 = require('../guards/roles.guard');
const user_entity_1 = require('../../users/entities/user.entity');
function MerchantOnly() {
  return (0, common_1.applyDecorators)(
    (0, common_1.UseGuards)(merchant_auth_guard_1.MerchantAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MERCHANT, user_entity_1.UserRole.ADMIN),
  );
}
//# sourceMappingURL=merchant-only.decorator.js.map
