/**
 * Repository providers for the merchants module
 *
 * This file provides TypeScript-compatible repository providers for the merchants module
 * using the decorator compatibility layer to avoid TypeScript decorator issues.
 */

import { Provider } from '@nestjs/common';
import { MerchantAnalytics } from '../entities/merchant-analytics.entity';
import {
  createRepositoryFactory,
  createRepositoryProvider,
} from '../../../utils/decorator-compatibility';

/**
 * Factory providers for merchant repositories
 */
export const merchantRepositoryFactories = [createRepositoryFactory(MerchantAnalytics)];

/**
 * Repository providers for merchant entities
 */
export const merchantRepositoryProviders: Provider[] = [
  createRepositoryProvider(MerchantAnalytics),
];
