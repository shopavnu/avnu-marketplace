import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSimilarityService } from './services/product-similarity.service';
import { PersonalizedRankingService } from './services/personalized-ranking.service';
import { RecommendationExperimentService } from './services/recommendation-experiment.service';
import { RecommendationController } from './controllers/recommendation.controller';
import { RecommendationResolver } from './resolvers/recommendation.resolver';
import { ProductSimilarity } from './entities/product-similarity.entity';
import { ProductRecommendation } from './entities/product-recommendation.entity';
import { RecommendationConfig } from './entities/recommendation-config.entity';
import { PersonalizationModule } from '../personalization/personalization.module';
import { ProductsModule } from '../products/products.module';
import { AbTestingModule } from '../ab-testing/ab-testing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductSimilarity, ProductRecommendation, RecommendationConfig]),
    ProductsModule,
    PersonalizationModule,
    AbTestingModule,
  ],
  providers: [
    ProductSimilarityService,
    PersonalizedRankingService,
    RecommendationExperimentService,
    RecommendationResolver,
  ],
  controllers: [RecommendationController],
  exports: [ProductSimilarityService, PersonalizedRankingService, RecommendationExperimentService],
})
export class RecommendationsModule {}
