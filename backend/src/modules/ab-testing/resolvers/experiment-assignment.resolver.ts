import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AbTestingService } from '../services/ab-testing.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserExperimentAssignment } from '../entities/user-experiment-assignment.entity';
import { VariantConfigurationType } from '../types/variant-configuration.type';
import { ExperimentType } from '../entities/experiment.entity';
// import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import {} from /* User */ '../../users/entities/user.entity';

@Resolver(() => UserExperimentAssignment)
export class ExperimentAssignmentResolver {
  constructor(private readonly abTestingService: AbTestingService) {}

  @Query(() => VariantConfigurationType, { name: 'searchExperiments', nullable: true })
  async getSearchExperiments(
    @Context() context, // @CurrentUser() /* user?: User */
  ) {
    const userId = null; // user?.id;
    const sessionId = context.req?.headers['x-session-id'] || null;

    return this.abTestingService.getSearchExperiments(userId, sessionId);
  }

  @Query(() => VariantConfigurationType, { name: 'personalizationExperiments', nullable: true })
  async getPersonalizationExperiments(
    @Context() context, // @CurrentUser() /* user?: User */
  ) {
    const userId = null; // user?.id;
    const sessionId = context.req?.headers['x-session-id'] || null;

    return this.abTestingService.getPersonalizationExperiments(userId, sessionId);
  }

  @Query(() => VariantConfigurationType, { name: 'recommendationExperiments', nullable: true })
  async getRecommendationExperiments(
    @Context() context, // @CurrentUser() /* user?: User */
  ) {
    const userId = null; // user?.id;
    const sessionId = context.req?.headers['x-session-id'] || null;

    return this.abTestingService.getRecommendationExperiments(userId, sessionId);
  }

  @Query(() => VariantConfigurationType, { name: 'uiExperiments', nullable: true })
  async getUiExperiments(
    @Context() context, // @CurrentUser() /* user?: User */
  ) {
    const userId = null; // user?.id;
    const sessionId = context.req?.headers['x-session-id'] || null;

    return this.abTestingService.getUiExperiments(userId, sessionId);
  }

  @Query(() => VariantConfigurationType, { name: 'experimentVariants', nullable: true })
  async getExperimentVariants(
    @Args('experimentType') experimentType: ExperimentType,
    @Context() context, // @CurrentUser() /* user?: User */
  ) {
    const userId = null; // user?.id;
    const sessionId = context.req?.headers['x-session-id'] || null;

    return this.abTestingService.getVariantConfiguration(experimentType, userId, sessionId);
  }

  @Mutation(() => Boolean)
  async trackImpression(@Args('assignmentId') assignmentId: string) {
    await this.abTestingService.trackImpression(assignmentId);
    return true;
  }

  @Mutation(() => Boolean)
  async trackInteraction(
    @Args('assignmentId') assignmentId: string,
    @Args('context', { nullable: true }) context?: string,
    @Args('metadata', { nullable: true }) metadata?: string,
  ) {
    await this.abTestingService.trackInteraction(
      assignmentId,
      context,
      metadata ? JSON.parse(metadata) : undefined,
    );
    return true;
  }

  @Mutation(() => Boolean)
  async trackConversion(
    @Args('assignmentId') assignmentId: string,
    @Args('value', { nullable: true }) value?: number,
    @Args('context', { nullable: true }) context?: string,
    @Args('metadata', { nullable: true }) metadata?: string,
  ) {
    await this.abTestingService.trackConversion(
      assignmentId,
      value,
      context,
      metadata ? JSON.parse(metadata) : undefined,
    );
    return true;
  }

  @Mutation(() => Boolean)
  async trackCustomEvent(
    @Args('assignmentId') assignmentId: string,
    @Args('eventType') eventType: string,
    @Args('value', { nullable: true }) value?: number,
    @Args('context', { nullable: true }) context?: string,
    @Args('metadata', { nullable: true }) metadata?: string,
  ) {
    await this.abTestingService.trackCustomEvent(
      assignmentId,
      eventType,
      value,
      context,
      metadata ? JSON.parse(metadata) : undefined,
    );
    return true;
  }

  @Query(() => [UserExperimentAssignment], { name: 'userAssignments' })
  @UseGuards(JwtAuthGuard)
  async getUserAssignments(
    @Context() context, // @CurrentUser() /* user: User */
  ) {
    const userId = null; // user.id;
    const sessionId = context.req?.headers['x-session-id'] || null;

    return this.abTestingService.getUserAssignments(userId, sessionId);
  }
}
