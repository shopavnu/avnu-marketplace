import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalizationService } from './services/personalization.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserBehaviorService } from './services/user-behavior.service';
import { SessionService } from './services/session.service';
import { UserPreferenceProfileService } from './services/user-preference-profile.service';
import { PersonalizationController } from './personalization.controller';
import { SessionController } from './controllers/session.controller';
import { UserPreferenceProfileController } from './controllers/user-preference-profile.controller';
import { PersonalizationResolver } from './personalization.resolver';
import { UserPreferenceProfileResolver } from './resolvers/user-preference-profile.resolver';
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
  controllers: [PersonalizationController, SessionController, UserPreferenceProfileController],
  providers: [
    PersonalizationService,
    UserPreferencesService,
    UserBehaviorService,
    SessionService,
    UserPreferenceProfileService,
    PersonalizationResolver,
    UserPreferenceProfileResolver,
  ],
  exports: [
    PersonalizationService, 
    UserPreferencesService, 
    UserBehaviorService, 
    SessionService,
    UserPreferenceProfileService
  ],
})
export class PersonalizationModule {}
