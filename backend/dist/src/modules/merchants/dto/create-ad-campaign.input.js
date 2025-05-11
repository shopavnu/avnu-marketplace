'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateAdCampaignInput = void 0;
const graphql_1 = require('@nestjs/graphql');
const class_validator_1 = require('class-validator');
const merchant_ad_campaign_entity_1 = require('../entities/merchant-ad-campaign.entity');
const graphql_2 = require('@nestjs/graphql');
let CreateAdCampaignInput = class CreateAdCampaignInput {};
exports.CreateAdCampaignInput = CreateAdCampaignInput;
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  CreateAdCampaignInput.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata('design:type', String),
  ],
  CreateAdCampaignInput.prototype,
  'description',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => merchant_ad_campaign_entity_1.CampaignType, {
      defaultValue: merchant_ad_campaign_entity_1.CampaignType.PRODUCT_PROMOTION,
    }),
    (0, class_validator_1.IsEnum)(merchant_ad_campaign_entity_1.CampaignType),
    __metadata('design:type', String),
  ],
  CreateAdCampaignInput.prototype,
  'type',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [graphql_1.ID]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata('design:type', Array),
  ],
  CreateAdCampaignInput.prototype,
  'productIds',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, class_validator_1.IsNumber)(),
    __metadata('design:type', Number),
  ],
  CreateAdCampaignInput.prototype,
  'budget',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => merchant_ad_campaign_entity_1.TargetAudience, {
      defaultValue: merchant_ad_campaign_entity_1.TargetAudience.ALL,
    }),
    (0, class_validator_1.IsEnum)(merchant_ad_campaign_entity_1.TargetAudience),
    __metadata('design:type', String),
  ],
  CreateAdCampaignInput.prototype,
  'targetAudience',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata('design:type', Array),
  ],
  CreateAdCampaignInput.prototype,
  'targetDemographics',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata('design:type', Array),
  ],
  CreateAdCampaignInput.prototype,
  'targetLocations',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata('design:type', Array),
  ],
  CreateAdCampaignInput.prototype,
  'targetInterests',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  CreateAdCampaignInput.prototype,
  'startDate',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata('design:type', Date),
  ],
  CreateAdCampaignInput.prototype,
  'endDate',
  void 0,
);
exports.CreateAdCampaignInput = CreateAdCampaignInput = __decorate(
  [(0, graphql_1.InputType)()],
  CreateAdCampaignInput,
);
//# sourceMappingURL=create-ad-campaign.input.js.map
