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
var EntityFacetGeneratorService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.EntityFacetGeneratorService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const search_entity_type_enum_1 = require('../enums/search-entity-type.enum');
let EntityFacetGeneratorService =
  (EntityFacetGeneratorService_1 = class EntityFacetGeneratorService {
    constructor(configService) {
      this.configService = configService;
      this.logger = new common_1.Logger(EntityFacetGeneratorService_1.name);
    }
    generateFacets(aggregations, entityType) {
      if (!aggregations) {
        return {
          categories: [],
          values: [],
        };
      }
      switch (entityType) {
        case search_entity_type_enum_1.SearchEntityType.PRODUCT:
          return this.generateProductFacets(aggregations);
        case search_entity_type_enum_1.SearchEntityType.MERCHANT:
          return this.generateMerchantFacets(aggregations);
        case search_entity_type_enum_1.SearchEntityType.BRAND:
          return this.generateBrandFacets(aggregations);
        case search_entity_type_enum_1.SearchEntityType.ALL:
          return this.generateAllEntityFacets(aggregations);
        default:
          return this.generateProductFacets(aggregations);
      }
    }
    generateProductFacets(aggregations) {
      const categories =
        aggregations.categories?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const values =
        aggregations.values?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      let price = undefined;
      if (aggregations.price_stats) {
        const priceRanges = [];
        if (aggregations.price_ranges) {
          aggregations.price_ranges.buckets.forEach(bucket => {
            priceRanges.push({
              min: bucket.from || aggregations.price_stats.min,
              max: bucket.to || aggregations.price_stats.max,
              count: bucket.doc_count,
            });
          });
        }
        price = {
          min: aggregations.price_stats.min,
          max: aggregations.price_stats.max,
          ranges: priceRanges,
        };
      }
      const brands =
        aggregations.brands?.buckets.map(bucket => ({
          facetType: 'TERMS',
          field: 'brand.name.keyword',
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const merchants =
        aggregations.merchants?.buckets.map(bucket => ({
          facetType: 'TERMS',
          field: 'merchant.name.keyword',
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const tags =
        aggregations.tags?.buckets.map(bucket => ({
          facetType: 'TERMS',
          field: 'tags.keyword',
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const colors =
        aggregations.colors?.buckets.map(bucket => ({
          facetType: 'TERMS',
          field: 'variants.attributes.color.keyword',
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const sizes =
        aggregations.sizes?.buckets.map(bucket => ({
          facetType: 'TERMS',
          field: 'variants.attributes.size.keyword',
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const materials =
        aggregations.materials?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      return {
        categories,
        values,
        price,
        brands,
        merchants,
        tags,
        colors,
        sizes,
        materials,
      };
    }
    generateMerchantFacets(aggregations) {
      const categories =
        aggregations.categories?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const values =
        aggregations.values?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const locations =
        aggregations.locations?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const ratings = [];
      if (aggregations.ratings) {
        for (let i = 1; i <= 5; i++) {
          const count = aggregations.ratings.buckets.find(b => b.key === i)?.doc_count || 0;
          if (count > 0) {
            ratings.push({ value: i, count });
          }
        }
      }
      const verificationStatus = [];
      if (aggregations.verification_status) {
        aggregations.verification_status.buckets.forEach(bucket => {
          verificationStatus.push({
            status: bucket.key === 'true' ? 'Verified' : 'Unverified',
            count: bucket.doc_count,
          });
        });
      }
      return {
        categories,
        values,
        locations,
        ratings,
        verificationStatus,
      };
    }
    generateBrandFacets(aggregations) {
      const categories =
        aggregations.categories?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const values =
        aggregations.values?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const locations =
        aggregations.locations?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const foundedYears = [];
      if (aggregations.founded_year_ranges) {
        aggregations.founded_year_ranges.buckets.forEach(bucket => {
          foundedYears.push({
            range: `${bucket.from || 'Before'} - ${bucket.to || 'Present'}`,
            count: bucket.doc_count,
          });
        });
      }
      const verificationStatus = [];
      if (aggregations.verification_status) {
        aggregations.verification_status.buckets.forEach(bucket => {
          verificationStatus.push({
            status: bucket.key === 'true' ? 'Verified' : 'Unverified',
            count: bucket.doc_count,
          });
        });
      }
      return {
        categories,
        values,
        locations,
        foundedYears,
        verificationStatus,
      };
    }
    generateAllEntityFacets(aggregations) {
      const categories =
        aggregations.categories?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const values =
        aggregations.values?.buckets.map(bucket => ({
          name: bucket.key,
          count: bucket.doc_count,
        })) || [];
      const entityTypes = [];
      if (aggregations.entity_type) {
        aggregations.entity_type.buckets.forEach(bucket => {
          entityTypes.push({
            name: bucket.key,
            count: bucket.doc_count,
          });
        });
      }
      return {
        categories,
        values,
        entityTypes,
      };
    }
    combineFacets(productFacets, merchantFacets, brandFacets) {
      const categoryMap = new Map();
      [productFacets, merchantFacets, brandFacets].forEach(facets => {
        if (!facets?.categories) return;
        facets.categories.forEach(category => {
          const currentCount = categoryMap.get(category.name) || 0;
          categoryMap.set(category.name, currentCount + category.count);
        });
      });
      const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count,
      }));
      const valueMap = new Map();
      [productFacets, merchantFacets, brandFacets].forEach(facets => {
        if (!facets?.values) return;
        facets.values.forEach(value => {
          const currentCount = valueMap.get(value.name) || 0;
          valueMap.set(value.name, currentCount + value.count);
        });
      });
      const values = Array.from(valueMap.entries()).map(([name, count]) => ({
        name,
        count,
      }));
      const price = productFacets?.price;
      const entityTypes = [
        {
          name: 'product',
          count: productFacets?.categories?.length
            ? productFacets.categories.reduce((sum, cat) => sum + cat.count, 0)
            : 0,
        },
        {
          name: 'merchant',
          count: merchantFacets?.categories?.length
            ? merchantFacets.categories.reduce((sum, cat) => sum + cat.count, 0)
            : 0,
        },
        {
          name: 'brand',
          count: brandFacets?.categories?.length
            ? brandFacets.categories.reduce((sum, cat) => sum + cat.count, 0)
            : 0,
        },
      ].filter(et => et.count > 0);
      return {
        categories,
        values,
        price,
        entityTypes,
      };
    }
    buildAggregationRequest(entityType) {
      const commonAggs = {
        categories: {
          terms: {
            field: 'categories.keyword',
            size: 30,
          },
        },
        values: {
          terms: {
            field: 'values.keyword',
            size: 30,
          },
        },
      };
      switch (entityType) {
        case search_entity_type_enum_1.SearchEntityType.PRODUCT:
          return {
            ...commonAggs,
            price_stats: {
              stats: {
                field: 'price',
              },
            },
            price_ranges: {
              range: {
                field: 'price',
                ranges: [
                  { to: 25 },
                  { from: 25, to: 50 },
                  { from: 50, to: 100 },
                  { from: 100, to: 200 },
                  { from: 200 },
                ],
              },
            },
            brands: {
              terms: {
                field: 'brandName.keyword',
                size: 20,
              },
            },
            merchants: {
              terms: {
                field: 'merchantName.keyword',
                size: 20,
              },
            },
            tags: {
              terms: {
                field: 'tags.keyword',
                size: 20,
              },
            },
            colors: {
              terms: {
                field: 'variants.attributes.color.keyword',
                size: 20,
              },
            },
            sizes: {
              terms: {
                field: 'variants.attributes.size.keyword',
                size: 20,
              },
            },
            materials: {
              terms: {
                field: 'materials.keyword',
                size: 20,
              },
            },
          };
        case search_entity_type_enum_1.SearchEntityType.MERCHANT:
          return {
            ...commonAggs,
            locations: {
              terms: {
                field: 'location.keyword',
                size: 20,
              },
            },
            ratings: {
              terms: {
                field: 'rating',
                size: 5,
              },
            },
            verification_status: {
              terms: {
                field: 'isVerified',
                size: 2,
              },
            },
          };
        case search_entity_type_enum_1.SearchEntityType.BRAND:
          return {
            ...commonAggs,
            locations: {
              terms: {
                field: 'location.keyword',
                size: 20,
              },
            },
            founded_year_ranges: {
              range: {
                field: 'foundedYear',
                ranges: [
                  { to: 1950 },
                  { from: 1950, to: 1980 },
                  { from: 1980, to: 2000 },
                  { from: 2000, to: 2010 },
                  { from: 2010, to: 2020 },
                  { from: 2020 },
                ],
              },
            },
            verification_status: {
              terms: {
                field: 'isVerified',
                size: 2,
              },
            },
          };
        case search_entity_type_enum_1.SearchEntityType.ALL:
          return {
            ...commonAggs,
            entity_type: {
              terms: {
                field: '_index',
                size: 3,
              },
            },
          };
        default:
          return commonAggs;
      }
    }
  });
exports.EntityFacetGeneratorService = EntityFacetGeneratorService;
exports.EntityFacetGeneratorService =
  EntityFacetGeneratorService =
  EntityFacetGeneratorService_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata('design:paramtypes', [config_1.ConfigService])],
      EntityFacetGeneratorService,
    );
//# sourceMappingURL=entity-facet-generator.service.js.map
