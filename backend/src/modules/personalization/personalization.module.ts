import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalizationService } from './services/personalization.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserBehaviorService } from './services/user-behavior.service';
import { SessionService } from './services/session.service';
import { PersonalizationController } from './personalization.controller';
import { SessionController } from './controllers/session.controller';
import { PersonalizationResolver } from './personalization.resolver';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserBehavior } from './entities/user-behavior.entity';
import { SessionEntity } from './entities/session.entity';
import { SessionInteractionEntity } from './entities/session-interaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPreferences,
      UserBehavior,
      SessionEntity,
      SessionInteractionEntity,
    ]),
  ],
  controllers: [PersonalizationController, SessionController],
  providers: [
    PersonalizationService,
    UserPreferencesService,
    UserBehaviorService,
    SessionService,
    PersonalizationResolver,
  ],
  exports: [PersonalizationService, UserPreferencesService, UserBehaviorService, SessionService],
})
export class PersonalizationModule {}
