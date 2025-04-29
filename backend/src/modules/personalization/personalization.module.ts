import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalizationService } from './services/personalization.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserBehaviorService } from './services/user-behavior.service';
import { SessionService } from './services/session.service';
import { AnonymousUserService } from './services/anonymous-user.service';
import { AnonymousUserAnalyticsService } from './services/anonymous-user-analytics.service';
import { UserPreferenceProfileService } from './services/user-preference-profile.service';
import { UserSegmentationService } from './services/user-segmentation.service';
import { PersonalizationMetricsService } from './services/personalization-metrics.service';
import { ABTestingService } from './services/ab-testing.service';
import { PersonalizationController } from './personalization.controller';
import { SessionController } from './controllers/session.controller';
import { AnonymousUserController } from './controllers/anonymous-user.controller';
import { UserPreferenceProfileController } from './controllers/user-preference-profile.controller';
import { PersonalizationResolver } from './personalization.resolver';
import { UserPreferenceProfileResolver } from './resolvers/user-preference-profile.resolver';
import { AnonymousUserAnalyticsResolver } from './resolvers/anonymous-user-analytics.resolver';
import { UserSegmentationResolver } from './resolvers/user-segmentation.resolver';
import { PersonalizationMetricsResolver } from './resolvers/personalization-metrics.resolver';
import { ABTestingResolver } from './resolvers/ab-testing.resolver';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserBehavior } from './entities/user-behavior.entity';
import { SessionEntity } from './entities/session.entity';
import { SessionInteractionEntity } from './entities/session-interaction.entity';
import { UserPreferenceProfile } from './entities/user-preference-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPreferences,
      UserBehavior,
      SessionEntity,
      SessionInteractionEntity,
      UserPreferenceProfile,
    ]),
  ],
  controllers: [
    PersonalizationController,
    SessionController,
    UserPreferenceProfileController,
    AnonymousUserController,
  ],
  providers: [
    PersonalizationService,
    UserPreferencesService,
    UserBehaviorService,
    SessionService,
    AnonymousUserService,
    AnonymousUserAnalyticsService,
    UserPreferenceProfileService,
    UserSegmentationService,
    PersonalizationMetricsService,
    ABTestingService,
    PersonalizationResolver,
    UserPreferenceProfileResolver,
    AnonymousUserAnalyticsResolver,
    UserSegmentationResolver,
    PersonalizationMetricsResolver,
    ABTestingResolver,
  ],
  exports: [
    PersonalizationService,
    UserPreferencesService,
    UserBehaviorService,
    SessionService,
    AnonymousUserService,
    AnonymousUserAnalyticsService,
    UserPreferenceProfileService,
  ],
})
export class PersonalizationModule {}
