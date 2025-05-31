import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import _axios from 'axios';
import { Cron } from '@nestjs/schedule';

/**
 * Represents a Shopify API version with its release and end-of-life dates
 */
export interface ShopifyApiVersion {
  version: string;
  releaseDate: Date;
  endOfLifeDate: Date;
  status: 'current' | 'supported' | 'deprecated' | 'unsupported';
}

/**
 * ShopifyVersionManagerService
 *
 * Responsible for:
 * 1. Managing API version transitions
 * 2. Checking for deprecated API features
 * 3. Providing version-specific endpoints and features
 * 4. Maintaining a migration path between versions
 */
@Injectable()
export class ShopifyVersionManagerService implements OnModuleInit {
  private readonly logger = new Logger(ShopifyVersionManagerService.name);
  private availableVersions: ShopifyApiVersion[] = [];
  private currentVersion: string;
  private nextVersion: string | null = null;
  private isTransitioning = false;
  private versionWarningThresholdDays = 30; // Days before EOL to start warning

  constructor(
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
    private readonly httpService: HttpService,
  ) {
    // Initialize with the configured version
    this.currentVersion = this.config.api.version;
  }

  async onModuleInit() {
    // Fetch available API versions when the service initializes
    await this.fetchAvailableVersions();
    // Check if current version is still supported
    await this.checkCurrentVersionStatus();
  }

  /**
   * Get the current API version to use
   * This is the main method that should be called by other services
   */
  getApiVersion(): string {
    return this.currentVersion;
  }

  /**
   * Get all available API versions
   */
  getAvailableVersions(): ShopifyApiVersion[] {
    return this.availableVersions;
  }

  /**
   * Check if a specific version is supported
   */
  isVersionSupported(version: string): boolean {
    const versionInfo = this.availableVersions.find(v => v.version === version);
    if (!versionInfo) return false;
    return ['current', 'supported'].includes(versionInfo.status);
  }

  /**
   * Get the recommended API version to use
   * This might be different from the current version if we're transitioning
   */
  getRecommendedVersion(): string {
    if (this.nextVersion && this.isTransitioning) {
      return this.nextVersion;
    }
    return this.currentVersion;
  }

  /**
   * Get version-specific endpoint URL
   * This adds the version to the endpoint URL
   */
  getVersionedEndpoint(shop: string, endpoint: string): string {
    return `https://${shop}/admin/api/${this.getApiVersion()}${endpoint}`;
  }

  /**
   * Get version-specific GraphQL URL
   */
  getGraphQLEndpoint(shop: string): string {
    return `https://${shop}/admin/api/${this.getApiVersion()}/graphql.json`;
  }

  /**
   * Check if a feature is available in the current version
   * @param featureName The name of the feature to check
   */
  isFeatureAvailable(featureName: string): boolean {
    // This would be expanded with actual feature version mappings
    const featureVersionMap: Record<string, string> = {
      bulk_operations: '2020-01',
      fulfillment_holds: '2023-07',
      localized_fields: '2024-01',
      selling_plans: '2021-01',
      fulfillment_order_holds: '2025-01',
    };

    const requiredVersion = featureVersionMap[featureName];
    if (!requiredVersion) return true; // If we don't have info, assume it's available

    // Compare versions (simple string comparison works for Shopify's YYYY-MM format)
    return this.getApiVersion() >= requiredVersion;
  }

  /**
   * Fetch available API versions from Shopify
   * This calls the Shopify API to get the current supported versions
   */
  @Cron('0 0 * * 0') // Run every Sunday at midnight
  async fetchAvailableVersions(): Promise<void> {
    try {
      // In a real implementation, this would call the Shopify API status endpoint
      const { data } = await firstValueFrom(
        this.httpService.get('https://www.shopifystatus.com/api/v2/versions.json').pipe(
          catchError((error: any) => {
            this.logger.error('Failed to fetch Shopify API versions', error);
            throw 'Failed to fetch available API versions';
          }),
        ),
      );

      if (data && Array.isArray(data.versions)) {
        this.availableVersions = this.parseVersionsResponse(data.versions);
        this.logger.log(`Fetched ${this.availableVersions.length} Shopify API versions`);
      }
    } catch (error) {
      this.logger.error('Error fetching Shopify API versions', error);
      // If we can't fetch versions, use hardcoded fallback versions
      this.setFallbackVersions();
    }
  }

  /**
   * Check if the current version is still supported
   * If not, plan for a version transition
   */
  @Cron('0 0 * * *') // Run every day at midnight
  async checkCurrentVersionStatus(): Promise<void> {
    try {
      // Find current version info
      const currentVersionInfo = this.availableVersions.find(
        v => v.version === this.currentVersion,
      );

      if (!currentVersionInfo) {
        this.logger.warn(`Current API version ${this.currentVersion} info not found`);
        return;
      }

      // Check if the current version is deprecated or approaching EOL
      const today = new Date();
      const daysUntilEol = Math.floor(
        (currentVersionInfo.endOfLifeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (currentVersionInfo.status === 'deprecated') {
        this.logger.warn(
          `Current API version ${this.currentVersion} is deprecated and will be unsupported after ${currentVersionInfo.endOfLifeDate.toISOString().split('T')[0]}`,
        );
        this.planVersionTransition();
      } else if (daysUntilEol <= this.versionWarningThresholdDays) {
        this.logger.warn(
          `Current API version ${this.currentVersion} will be deprecated in ${daysUntilEol} days`,
        );
        this.planVersionTransition();
      } else {
        this.logger.log(
          `Current API version ${this.currentVersion} is supported until ${currentVersionInfo.endOfLifeDate.toISOString().split('T')[0]}`,
        );
      }
    } catch (error) {
      this.logger.error('Error checking API version status', error);
    }
  }

  /**
   * Plan a transition to a newer API version
   */
  private planVersionTransition(): void {
    // Find the latest stable version to transition to
    const stableVersions = this.availableVersions.filter(v => v.status === 'current');
    if (stableVersions.length === 0) {
      this.logger.error('No stable API versions found for transition');
      return;
    }

    // Sort versions in descending order (latest first)
    stableVersions.sort((a, b) => b.version.localeCompare(a.version));
    const latestVersion = stableVersions[0].version;

    // Set the next version and mark as transitioning
    if (latestVersion !== this.currentVersion) {
      this.nextVersion = latestVersion;
      this.isTransitioning = true;
      this.logger.log(`Planning transition from ${this.currentVersion} to ${this.nextVersion}`);
    }
  }

  /**
   * Execute the transition to the new API version
   * This would be called manually or through an admin action
   */
  async executeVersionTransition(): Promise<boolean> {
    if (!this.nextVersion || !this.isTransitioning) {
      this.logger.warn('No version transition is currently planned');
      return false;
    }

    try {
      // Here we would perform any necessary migrations for the new version
      // For example, updating GraphQL queries, checking for deprecated fields, etc.
      this.logger.log(`Executing transition from ${this.currentVersion} to ${this.nextVersion}`);

      // Check for breaking changes and compatibility
      await this.checkBreakingChanges(this.currentVersion, this.nextVersion);

      // Once migration is complete, update the current version
      this.currentVersion = this.nextVersion;
      this.nextVersion = null;
      this.isTransitioning = false;

      // In a real implementation, we might update the configuration in the database
      // so that other instances pick up the new version
      this.logger.log(`Successfully transitioned to API version ${this.currentVersion}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to transition to version ${this.nextVersion}`, error);
      return false;
    }
  }

  /**
   * Check for breaking changes between API versions
   */
  private async checkBreakingChanges(fromVersion: string, toVersion: string): Promise<void> {
    // In a real implementation, this would check for breaking changes
    // between the two versions and prepare migration steps
    this.logger.log(`Checking for breaking changes between ${fromVersion} and ${toVersion}`);

    // Example: Construct a list of breaking changes
    const breakingChanges = this.getBreakingChanges(fromVersion, toVersion);

    if (breakingChanges.length > 0) {
      this.logger.warn(`Found ${breakingChanges.length} breaking changes that need migration`);
      // Log each breaking change
      breakingChanges.forEach(change => {
        this.logger.warn(`- ${change.type}: ${change.description}`);
      });
    } else {
      this.logger.log('No breaking changes found that require migration');
    }
  }

  /**
   * Get a list of breaking changes between two versions
   * This would ideally be populated from Shopify's developer documentation
   */
  private getBreakingChanges(
    fromVersion: string,
    toVersion: string,
  ): Array<{ type: string; description: string }> {
    // This is a placeholder implementation
    // In a real service, this would be populated with actual breaking changes
    // from Shopify's developer documentation or API
    const breakingChanges: Array<{ type: string; description: string }> = [];

    // Example breaking changes (these would be actual changes from Shopify docs)
    if (fromVersion === '2024-07' && toVersion === '2025-01') {
      breakingChanges.push({
        type: 'deprecated_field',
        description: 'Product.legacyResourceId field has been removed. Use id instead.',
      });
      breakingChanges.push({
        type: 'input_change',
        description: 'OrderInput requires fulfillmentStatus to be one of the new enum values.',
      });
    }

    return breakingChanges;
  }

  /**
   * Parse the versions response from Shopify API status endpoint
   */
  private parseVersionsResponse(versionsData: any[]): ShopifyApiVersion[] {
    try {
      return versionsData.map(v => ({
        version: v.version || v.handle,
        releaseDate: new Date(v.created_at || v.released_at),
        endOfLifeDate: new Date(v.end_of_life_date || v.deprecated_at),
        status: this.determineVersionStatus(
          v.display_status,
          new Date(v.end_of_life_date || v.deprecated_at),
        ),
      }));
    } catch (error) {
      this.logger.error('Error parsing versions response', error);
      return [];
    }
  }

  /**
   * Determine the status of a version based on its display status and EOL date
   */
  private determineVersionStatus(
    displayStatus: string,
    eolDate: Date,
  ): 'current' | 'supported' | 'deprecated' | 'unsupported' {
    const today = new Date();

    if (displayStatus === 'latest' || displayStatus === 'current') {
      return 'current';
    }

    if (eolDate < today) {
      return 'unsupported';
    }

    // If EOL is within warning threshold, consider it deprecated
    const daysUntilEol = Math.floor((eolDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilEol <= this.versionWarningThresholdDays) {
      return 'deprecated';
    }

    return 'supported';
  }

  /**
   * Set fallback versions in case we can't fetch from the API
   */
  private setFallbackVersions(): void {
    const today = new Date();
    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    // Current version (as of 2025)
    const _currentYear = new Date().getFullYear();

    // Create quarterly versions for current year and next year
    const versions: ShopifyApiVersion[] = [];

    // Add current known versions
    versions.push({
      version: '2025-01',
      releaseDate: new Date('2025-01-01'),
      endOfLifeDate: new Date('2026-01-31'),
      status: 'current',
    });

    versions.push({
      version: '2024-10',
      releaseDate: new Date('2024-10-01'),
      endOfLifeDate: new Date('2025-10-31'),
      status: 'supported',
    });

    versions.push({
      version: '2024-07',
      releaseDate: new Date('2024-07-01'),
      endOfLifeDate: new Date('2025-07-31'),
      status: 'supported',
    });

    versions.push({
      version: '2024-04',
      releaseDate: new Date('2024-04-01'),
      endOfLifeDate: new Date('2025-04-30'),
      status: 'supported',
    });

    versions.push({
      version: '2024-01',
      releaseDate: new Date('2024-01-01'),
      endOfLifeDate: new Date('2025-01-31'),
      status: 'deprecated',
    });

    this.availableVersions = versions;
    this.logger.log('Using fallback API versions');
  }
}
