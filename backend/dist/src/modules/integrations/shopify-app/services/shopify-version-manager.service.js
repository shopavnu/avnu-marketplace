"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ShopifyVersionManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyVersionManagerService = void 0;
const common_1 = require("@nestjs/common");
const shopify_config_1 = require("../../../common/config/shopify-config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const schedule_1 = require("@nestjs/schedule");
let ShopifyVersionManagerService = ShopifyVersionManagerService_1 = class ShopifyVersionManagerService {
    constructor(config, httpService) {
        this.config = config;
        this.httpService = httpService;
        this.logger = new common_1.Logger(ShopifyVersionManagerService_1.name);
        this.availableVersions = [];
        this.nextVersion = null;
        this.isTransitioning = false;
        this.versionWarningThresholdDays = 30;
        this.currentVersion = this.config.api.version;
    }
    async onModuleInit() {
        await this.fetchAvailableVersions();
        await this.checkCurrentVersionStatus();
    }
    getApiVersion() {
        return this.currentVersion;
    }
    getAvailableVersions() {
        return this.availableVersions;
    }
    isVersionSupported(version) {
        const versionInfo = this.availableVersions.find(v => v.version === version);
        if (!versionInfo)
            return false;
        return ['current', 'supported'].includes(versionInfo.status);
    }
    getRecommendedVersion() {
        if (this.nextVersion && this.isTransitioning) {
            return this.nextVersion;
        }
        return this.currentVersion;
    }
    getVersionedEndpoint(shop, endpoint) {
        return `https://${shop}/admin/api/${this.getApiVersion()}${endpoint}`;
    }
    getGraphQLEndpoint(shop) {
        return `https://${shop}/admin/api/${this.getApiVersion()}/graphql.json`;
    }
    isFeatureAvailable(featureName) {
        const featureVersionMap = {
            bulk_operations: '2020-01',
            fulfillment_holds: '2023-07',
            localized_fields: '2024-01',
            selling_plans: '2021-01',
            fulfillment_order_holds: '2025-01',
        };
        const requiredVersion = featureVersionMap[featureName];
        if (!requiredVersion)
            return true;
        return this.getApiVersion() >= requiredVersion;
    }
    async fetchAvailableVersions() {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get('https://status.shopify.com/api/v2/versions.json').pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error('Failed to fetch Shopify API versions', error);
                throw 'Failed to fetch available API versions';
            })));
            if (data && Array.isArray(data.versions)) {
                this.availableVersions = this.parseVersionsResponse(data.versions);
                this.logger.log(`Fetched ${this.availableVersions.length} Shopify API versions`);
            }
        }
        catch (error) {
            this.logger.error('Error fetching Shopify API versions', error);
            this.setFallbackVersions();
        }
    }
    async checkCurrentVersionStatus() {
        try {
            const currentVersionInfo = this.availableVersions.find(v => v.version === this.currentVersion);
            if (!currentVersionInfo) {
                this.logger.warn(`Current API version ${this.currentVersion} info not found`);
                return;
            }
            const today = new Date();
            const daysUntilEol = Math.floor((currentVersionInfo.endOfLifeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (currentVersionInfo.status === 'deprecated') {
                this.logger.warn(`Current API version ${this.currentVersion} is deprecated and will be unsupported after ${currentVersionInfo.endOfLifeDate.toISOString().split('T')[0]}`);
                this.planVersionTransition();
            }
            else if (daysUntilEol <= this.versionWarningThresholdDays) {
                this.logger.warn(`Current API version ${this.currentVersion} will be deprecated in ${daysUntilEol} days`);
                this.planVersionTransition();
            }
            else {
                this.logger.log(`Current API version ${this.currentVersion} is supported until ${currentVersionInfo.endOfLifeDate.toISOString().split('T')[0]}`);
            }
        }
        catch (error) {
            this.logger.error('Error checking API version status', error);
        }
    }
    planVersionTransition() {
        const stableVersions = this.availableVersions.filter(v => v.status === 'current');
        if (stableVersions.length === 0) {
            this.logger.error('No stable API versions found for transition');
            return;
        }
        stableVersions.sort((a, b) => b.version.localeCompare(a.version));
        const latestVersion = stableVersions[0].version;
        if (latestVersion !== this.currentVersion) {
            this.nextVersion = latestVersion;
            this.isTransitioning = true;
            this.logger.log(`Planning transition from ${this.currentVersion} to ${this.nextVersion}`);
        }
    }
    async executeVersionTransition() {
        if (!this.nextVersion || !this.isTransitioning) {
            this.logger.warn('No version transition is currently planned');
            return false;
        }
        try {
            this.logger.log(`Executing transition from ${this.currentVersion} to ${this.nextVersion}`);
            await this.checkBreakingChanges(this.currentVersion, this.nextVersion);
            this.currentVersion = this.nextVersion;
            this.nextVersion = null;
            this.isTransitioning = false;
            this.logger.log(`Successfully transitioned to API version ${this.currentVersion}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to transition to version ${this.nextVersion}`, error);
            return false;
        }
    }
    async checkBreakingChanges(fromVersion, toVersion) {
        this.logger.log(`Checking for breaking changes between ${fromVersion} and ${toVersion}`);
        const breakingChanges = this.getBreakingChanges(fromVersion, toVersion);
        if (breakingChanges.length > 0) {
            this.logger.warn(`Found ${breakingChanges.length} breaking changes that need migration`);
            breakingChanges.forEach(change => {
                this.logger.warn(`- ${change.type}: ${change.description}`);
            });
        }
        else {
            this.logger.log('No breaking changes found that require migration');
        }
    }
    getBreakingChanges(fromVersion, toVersion) {
        const breakingChanges = [];
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
    parseVersionsResponse(versionsData) {
        try {
            return versionsData.map(v => ({
                version: v.version || v.handle,
                releaseDate: new Date(v.created_at || v.released_at),
                endOfLifeDate: new Date(v.end_of_life_date || v.deprecated_at),
                status: this.determineVersionStatus(v.display_status, new Date(v.end_of_life_date || v.deprecated_at)),
            }));
        }
        catch (error) {
            this.logger.error('Error parsing versions response', error);
            return [];
        }
    }
    determineVersionStatus(displayStatus, eolDate) {
        const today = new Date();
        if (displayStatus === 'latest' || displayStatus === 'current') {
            return 'current';
        }
        if (eolDate < today) {
            return 'unsupported';
        }
        const daysUntilEol = Math.floor((eolDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilEol <= this.versionWarningThresholdDays) {
            return 'deprecated';
        }
        return 'supported';
    }
    setFallbackVersions() {
        const today = new Date();
        const oneYearFromNow = new Date(today);
        oneYearFromNow.setFullYear(today.getFullYear() + 1);
        const _currentYear = new Date().getFullYear();
        const versions = [];
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
};
exports.ShopifyVersionManagerService = ShopifyVersionManagerService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * 0'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopifyVersionManagerService.prototype, "fetchAvailableVersions", null);
__decorate([
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopifyVersionManagerService.prototype, "checkCurrentVersionStatus", null);
exports.ShopifyVersionManagerService = ShopifyVersionManagerService = ShopifyVersionManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
    __metadata("design:paramtypes", [void 0, axios_1.HttpService])
], ShopifyVersionManagerService);
//# sourceMappingURL=shopify-version-manager.service.js.map