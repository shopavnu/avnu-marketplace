import { registerEnumType } from '@nestjs/graphql';

/**
 * Enum representing user roles in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MERCHANT = 'MERCHANT',
  SHOPPER = 'SHOPPER',
}

// Register the enum with GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role types',
});
