"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRecommendationTables1714600000000 = void 0;
class AddRecommendationTables1714600000000 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TYPE similarity_type_enum AS ENUM (
        'attribute_based',
        'view_based',
        'hybrid'
      );

      CREATE TABLE product_similarities (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        source_product_id uuid NOT NULL,
        target_product_id uuid NOT NULL,
        similarity_type similarity_type_enum NOT NULL DEFAULT 'attribute_based',
        score float NOT NULL DEFAULT 0,
        metadata jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_product_similarities_source_product_id ON product_similarities(source_product_id);
      CREATE INDEX idx_product_similarities_target_product_id ON product_similarities(target_product_id);
      CREATE INDEX idx_product_similarities_similarity_type ON product_similarities(similarity_type);
      CREATE UNIQUE INDEX idx_product_similarities_unique ON product_similarities(source_product_id, target_product_id, similarity_type);
    `);
        await queryRunner.query(`
      CREATE TYPE recommendation_algorithm_type_enum AS ENUM (
        'content_based',
        'collaborative_filtering',
        'hybrid',
        'rule_based',
        'popularity_based',
        'attribute_based',
        'embedding_based',
        'custom'
      );

      CREATE TABLE recommendation_configs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar NOT NULL,
        description varchar,
        algorithm_type recommendation_algorithm_type_enum NOT NULL DEFAULT 'content_based',
        is_active boolean NOT NULL DEFAULT true,
        version integer NOT NULL DEFAULT 1,
        parameters jsonb NOT NULL DEFAULT '{}',
        supported_recommendation_types text[],
        default_limit integer NOT NULL DEFAULT 10,
        total_impressions integer NOT NULL DEFAULT 0,
        total_clicks integer NOT NULL DEFAULT 0,
        total_conversions integer NOT NULL DEFAULT 0,
        experiment_id varchar,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );

      CREATE UNIQUE INDEX idx_recommendation_configs_name ON recommendation_configs(name);
    `);
        await queryRunner.query(`
      CREATE TYPE recommendation_type_enum AS ENUM (
        'similar_products',
        'frequently_bought_together',
        'complementary_products',
        'personalized',
        'trending',
        'top_rated',
        'recently_viewed',
        'price_drop',
        'seasonal',
        'featured'
      );

      CREATE TABLE product_recommendations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id varchar NOT NULL,
        session_id varchar,
        product_id uuid NOT NULL,
        recommendation_type recommendation_type_enum NOT NULL DEFAULT 'similar_products',
        algorithm_id uuid NOT NULL,
        score float NOT NULL DEFAULT 0,
        position integer NOT NULL DEFAULT 0,
        impressions integer NOT NULL DEFAULT 0,
        clicks integer NOT NULL DEFAULT 0,
        conversions integer NOT NULL DEFAULT 0,
        conversion_rate float NOT NULL DEFAULT 0,
        click_through_rate float NOT NULL DEFAULT 0,
        metadata jsonb,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_product_recommendations_user_id ON product_recommendations(user_id);
      CREATE INDEX idx_product_recommendations_session_id ON product_recommendations(session_id);
      CREATE INDEX idx_product_recommendations_product_id ON product_recommendations(product_id);
      CREATE INDEX idx_product_recommendations_recommendation_type ON product_recommendations(recommendation_type);
    `);
        await queryRunner.query(`
      INSERT INTO recommendation_configs 
        (name, description, algorithm_type, is_active, version, parameters, supported_recommendation_types)
      VALUES 
        (
          'Default Content-Based', 
          'Default content-based recommendation algorithm using product attributes', 
          'content_based', 
          true, 
          1, 
          '{"categoryWeight": 0.4, "brandWeight": 0.2, "priceWeight": 0.15, "tagsWeight": 0.15, "attributesWeight": 0.1}', 
          ARRAY['personalized', 'similar_products']
        ),
        (
          'Default Collaborative Filtering', 
          'Default collaborative filtering algorithm based on user behavior', 
          'collaborative_filtering', 
          true, 
          1, 
          '{"recencyWeight": 0.6, "positionWeight": 0.4}', 
          ARRAY['personalized']
        ),
        (
          'Default Hybrid', 
          'Default hybrid algorithm combining content-based and collaborative filtering', 
          'hybrid', 
          true, 
          1, 
          '{"contentWeight": 0.6, "collaborativeWeight": 0.4}', 
          ARRAY['personalized']
        ),
        (
          'Default Popularity-Based', 
          'Default popularity-based algorithm for new users or fallback', 
          'popularity_based', 
          true, 
          1, 
          '{"viewWeight": 0.4, "purchaseWeight": 0.6}', 
          ARRAY['trending', 'top_rated']
        );
    `);
        await queryRunner.query(`
      ALTER TYPE session_interaction_type_enum ADD VALUE IF NOT EXISTS 'RECOMMENDATION_IMPRESSION';
      ALTER TYPE session_interaction_type_enum ADD VALUE IF NOT EXISTS 'RECOMMENDATION_CLICK';
      ALTER TYPE session_interaction_type_enum ADD VALUE IF NOT EXISTS 'RECOMMENDATION_CONVERSION';
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS product_recommendations;`);
        await queryRunner.query(`DROP TYPE IF EXISTS recommendation_type_enum;`);
        await queryRunner.query(`DROP TABLE IF EXISTS recommendation_configs;`);
        await queryRunner.query(`DROP TYPE IF EXISTS recommendation_algorithm_type_enum;`);
        await queryRunner.query(`DROP TABLE IF EXISTS product_similarities;`);
        await queryRunner.query(`DROP TYPE IF EXISTS similarity_type_enum;`);
    }
}
exports.AddRecommendationTables1714600000000 = AddRecommendationTables1714600000000;
//# sourceMappingURL=1714600000000-AddRecommendationTables.js.map