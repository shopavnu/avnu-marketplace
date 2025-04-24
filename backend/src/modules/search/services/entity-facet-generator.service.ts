import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchEntityType } from '../enums/search-entity-type.enum'; // Updated import path
import { SearchFacets } from '../dto/search-response.dto';

/**
 * Service for generating entity-specific facets from search results
 */
@Injectable()
export class EntityFacetGeneratorService {
  private readonly logger = new Logger(EntityFacetGeneratorService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate facets from Elasticsearch aggregations based on entity type
   * @param aggregations Elasticsearch aggregations
   * @param entityType Entity type
   * @returns Formatted facets
   */
  generateFacets(aggregations: any, entityType: SearchEntityType): SearchFacets {
    if (!aggregations) {
      return {
        categories: [],
        values: [],
      };
    }

    switch (entityType) {
      case SearchEntityType.PRODUCT:
        return this.generateProductFacets(aggregations);
      case SearchEntityType.MERCHANT:
        return this.generateMerchantFacets(aggregations);
      case SearchEntityType.BRAND:
        return this.generateBrandFacets(aggregations);
      case SearchEntityType.ALL:
        return this.generateAllEntityFacets(aggregations);
      default:
        return this.generateProductFacets(aggregations);
    }
  }

  /**
   * Generate product-specific facets
   * @param aggregations Elasticsearch aggregations
   * @returns Product facets
   */
  private generateProductFacets(aggregations: any): SearchFacets {
    // Extract category facets
    const categories =
      aggregations.categories?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract value facets
    const values =
      aggregations.values?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract price facets
    let price = undefined;
    if (aggregations.price_stats) {
      const priceRanges = [];

      // Create price ranges if price_ranges aggregation exists
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

    // Extract brand facets
    const brands =
      aggregations.brands?.buckets.map(bucket => ({
        facetType: 'TERMS',
        field: 'brand.name.keyword',
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract merchant facets
    const merchants =
      aggregations.merchants?.buckets.map(bucket => ({
        facetType: 'TERMS',
        field: 'merchant.name.keyword',
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract tag facets
    const tags =
      aggregations.tags?.buckets.map(bucket => ({
        facetType: 'TERMS',
        field: 'tags.keyword',
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract color facets
    const colors =
      aggregations.colors?.buckets.map(bucket => ({
        facetType: 'TERMS',
        field: 'variants.attributes.color.keyword',
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract size facets
    const sizes =
      aggregations.sizes?.buckets.map(bucket => ({
        facetType: 'TERMS',
        field: 'variants.attributes.size.keyword',
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract material facets
    const materials =
      aggregations.materials?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    return {
      categories,
      values,
      price,
      // Add product-specific facets
      brands,
      merchants,
      tags,
      colors,
      sizes,
      materials,
    };
  }

  /**
   * Generate merchant-specific facets
   * @param aggregations Elasticsearch aggregations
   * @returns Merchant facets
   */
  private generateMerchantFacets(aggregations: any): SearchFacets {
    // Extract category facets
    const categories =
      aggregations.categories?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract value facets
    const values =
      aggregations.values?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract location facets
    const locations =
      aggregations.locations?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract rating facets
    const ratings = [];
    if (aggregations.ratings) {
      for (let i = 1; i <= 5; i++) {
        const count = aggregations.ratings.buckets.find(b => b.key === i)?.doc_count || 0;
        if (count > 0) {
          ratings.push({ value: i, count });
        }
      }
    }

    // Extract verification status facets
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
      // Add merchant-specific facets
      locations,
      ratings,
      verificationStatus,
    };
  }

  /**
   * Generate brand-specific facets
   * @param aggregations Elasticsearch aggregations
   * @returns Brand facets
   */
  private generateBrandFacets(aggregations: any): SearchFacets {
    // Extract category facets
    const categories =
      aggregations.categories?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract value facets
    const values =
      aggregations.values?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract location facets
    const locations =
      aggregations.locations?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract founded year facets
    const foundedYears = [];
    if (aggregations.founded_year_ranges) {
      aggregations.founded_year_ranges.buckets.forEach(bucket => {
        foundedYears.push({
          range: `${bucket.from || 'Before'} - ${bucket.to || 'Present'}`,
          count: bucket.doc_count,
        });
      });
    }

    // Extract verification status facets
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
      // Add brand-specific facets
      locations,
      foundedYears,
      verificationStatus,
    };
  }

  /**
   * Generate facets for all entity types combined
   * @param aggregations Elasticsearch aggregations
   * @returns Combined facets
   */
  private generateAllEntityFacets(aggregations: any): SearchFacets {
    // For combined entity search, we'll use a simplified facet structure
    // that includes common facets across all entity types

    // Extract category facets
    const categories =
      aggregations.categories?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract value facets
    const values =
      aggregations.values?.buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
      })) || [];

    // Extract entity type facets
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

  /**
   * Combine facets from multiple entity searches
   * @param productFacets Product facets
   * @param merchantFacets Merchant facets
   * @param brandFacets Brand facets
   * @returns Combined facets
   */
  combineFacets(productFacets: any, merchantFacets: any, brandFacets: any): SearchFacets {
    // Combine category facets
    const categoryMap = new Map<string, number>();

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

    // Combine value facets
    const valueMap = new Map<string, number>();

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

    // Use product price facets
    const price = productFacets?.price;

    // Create entity type facets
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

  /**
   * Build Elasticsearch aggregation request based on entity type
   * @param entityType Entity type
   * @returns Elasticsearch aggregations request
   */
  buildAggregationRequest(entityType: SearchEntityType): any {
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
      case SearchEntityType.PRODUCT:
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

      case SearchEntityType.MERCHANT:
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

      case SearchEntityType.BRAND:
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

      case SearchEntityType.ALL:
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
}
