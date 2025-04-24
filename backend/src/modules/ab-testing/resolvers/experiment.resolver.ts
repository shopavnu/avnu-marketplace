import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AbTestingService } from '../services/ab-testing.service';
import { Experiment } from '../entities/experiment.entity';
import { CreateExperimentDto } from '../dto/create-experiment.dto';
import { UpdateExperimentDto } from '../dto/update-experiment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';
import {} from /* UserRole */ '../../users/entities/user.entity';
import { ExperimentResultsType } from '../types/experiment-results.type';
import { StatisticalSignificanceType } from '../types/statistical-significance.type';
import { TimeToCompletionType } from '../types/time-to-completion.type';
import { MetricsOverTimeType } from '../types/metrics-over-time.type';

@Resolver(() => Experiment)
export class ExperimentResolver {
  constructor(private readonly abTestingService: AbTestingService) {}

  @Mutation(() => Experiment)
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  createExperiment(@Args('createExperimentDto') createExperimentDto: CreateExperimentDto) {
    return this.abTestingService.createExperiment(createExperimentDto);
  }

  @Query(() => [Experiment], { name: 'experiments' })
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  findAll(@Args('status', { nullable: true }) status?: string) {
    return this.abTestingService.getAllExperiments(status as any);
  }

  @Query(() => Experiment, { name: 'experiment' })
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  findOne(@Args('id') id: string) {
    return this.abTestingService.getExperimentById(id);
  }

  @Mutation(() => Experiment)
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  updateExperiment(
    @Args('id') id: string,
    @Args('updateExperimentDto') updateExperimentDto: UpdateExperimentDto,
  ) {
    return this.abTestingService.updateExperiment(id, updateExperimentDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  removeExperiment(@Args('id') id: string) {
    this.abTestingService.deleteExperiment(id);
    return true;
  }

  @Mutation(() => Experiment)
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  startExperiment(@Args('id') id: string) {
    return this.abTestingService.startExperiment(id);
  }

  @Mutation(() => Experiment)
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  pauseExperiment(@Args('id') id: string) {
    return this.abTestingService.pauseExperiment(id);
  }

  @Mutation(() => Experiment)
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  completeExperiment(@Args('id') id: string) {
    return this.abTestingService.completeExperiment(id);
  }

  @Mutation(() => Experiment)
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  archiveExperiment(@Args('id') id: string) {
    return this.abTestingService.archiveExperiment(id);
  }

  @Mutation(() => Experiment)
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  declareWinner(@Args('experimentId') experimentId: string, @Args('variantId') variantId: string) {
    return this.abTestingService.declareWinner(experimentId, variantId);
  }

  @Query(() => ExperimentResultsType, { name: 'experimentResults' })
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  getExperimentResults(@Args('id') id: string) {
    return this.abTestingService.getExperimentResults(id);
  }

  @Query(() => StatisticalSignificanceType, { name: 'experimentSignificance' })
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  getStatisticalSignificance(@Args('id') id: string) {
    return this.abTestingService.calculateStatisticalSignificance(id);
  }

  @Query(() => TimeToCompletionType, { name: 'experimentTimeToCompletion' })
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  getTimeToCompletion(
    @Args('id') id: string,
    @Args('dailyTraffic', { type: () => Int }) dailyTraffic: number,
  ) {
    return this.abTestingService.estimateTimeToCompletion(id, dailyTraffic);
  }

  @Query(() => MetricsOverTimeType, { name: 'experimentMetricsOverTime' })
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  getMetricsOverTime(
    @Args('id') id: string,
    @Args('interval', { nullable: true }) interval?: 'day' | 'week' | 'month',
  ) {
    return this.abTestingService.getMetricsOverTime(id, interval);
  }

  @Query(() => Int, { name: 'requiredSampleSize' })
  @UseGuards(JwtAuthGuard) // RolesGuard)
  // @Roles(UserRole.ADMIN)
  getRequiredSampleSize(
    @Args('baselineConversionRate') baselineConversionRate: number,
    @Args('minimumDetectableEffect') minimumDetectableEffect: number,
    @Args('significanceLevel', { nullable: true }) significanceLevel?: number,
    @Args('power', { nullable: true }) power?: number,
  ) {
    return this.abTestingService.calculateRequiredSampleSize(
      baselineConversionRate,
      minimumDetectableEffect,
      significanceLevel,
      power,
    );
  }
}
