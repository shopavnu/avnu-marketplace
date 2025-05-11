import { OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { HttpService } from '@nestjs/axios';
export interface ShopifyApiVersion {
  version: string;
  releaseDate: Date;
  endOfLifeDate: Date;
  status: 'current' | 'supported' | 'deprecated' | 'unsupported';
}
export declare class ShopifyVersionManagerService implements OnModuleInit {
  private readonly config;
  private readonly httpService;
  private readonly logger;
  private availableVersions;
  private currentVersion;
  private nextVersion;
  private isTransitioning;
  private versionWarningThresholdDays;
  constructor(config: ConfigType<typeof shopifyConfig>, httpService: HttpService);
  onModuleInit(): Promise<void>;
  getApiVersion(): string;
  getAvailableVersions(): ShopifyApiVersion[];
  isVersionSupported(version: string): boolean;
  getRecommendedVersion(): string;
  getVersionedEndpoint(shop: string, endpoint: string): string;
  getGraphQLEndpoint(shop: string): string;
  isFeatureAvailable(featureName: string): boolean;
  fetchAvailableVersions(): Promise<void>;
  checkCurrentVersionStatus(): Promise<void>;
  private planVersionTransition;
  executeVersionTransition(): Promise<boolean>;
  private checkBreakingChanges;
  private getBreakingChanges;
  private parseVersionsResponse;
  private determineVersionStatus;
  private setFallbackVersions;
}
