import { Provider } from '@nestjs/common';
import { AdBudgetManagementService } from '../services/ad-budget-management.service';
import { AdPlacementService } from '../services/ad-placement.service';

export const adServiceProviders: Provider[] = [
  AdBudgetManagementService,
  AdPlacementService,
];
