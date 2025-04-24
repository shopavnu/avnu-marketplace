import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experiment } from './entities/experiment.entity';
import { ExperimentVariant } from './entities/experiment-variant.entity';
import { ExperimentResult } from './entities/experiment-result.entity';
import { UserExperimentAssignment } from './entities/user-experiment-assignment.entity';
import { ExperimentService } from './services/experiment.service';
import { ExperimentAssignmentService } from './services/experiment-assignment.service';
import { ExperimentAnalysisService } from './services/experiment-analysis.service';
import { AbTestingService } from './services/ab-testing.service';
import { ExperimentResolver } from './resolvers/experiment.resolver';
import { ExperimentAssignmentResolver } from './resolvers/experiment-assignment.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Experiment,
      ExperimentVariant,
      ExperimentResult,
      UserExperimentAssignment,
    ]),
  ],
  providers: [
    ExperimentService,
    ExperimentAssignmentService,
    ExperimentAnalysisService,
    AbTestingService,
    ExperimentResolver,
    ExperimentAssignmentResolver,
  ],
  exports: [AbTestingService, ExperimentAssignmentService],
})
export class AbTestingModule {}
