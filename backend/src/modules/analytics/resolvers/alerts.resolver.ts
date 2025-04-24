import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, forwardRef, Inject } from '@nestjs/common';
import { AlertsService } from '../services/alerts.service';
import { AlertEntity } from '../entities/alert.entity';
import { AlertStatus, AlertType } from '../enums/alert.enum';
import { AdminGuard } from '../../auth/guards/admin.guard';

@Resolver(() => AlertEntity)
@UseGuards(AdminGuard)
export class AlertsResolver {
  constructor(
    @Inject(forwardRef(() => AlertsService))
    private readonly alertsService: AlertsService,
  ) {}

  @Query(() => [AlertEntity])
  async alerts(
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('period', { type: () => Number, nullable: true, defaultValue: 30 }) period?: number,
  ): Promise<AlertEntity[]> {
    return this.alertsService.getAlerts(status as AlertStatus, type as AlertType, period);
  }

  @Mutation(() => AlertEntity)
  async updateAlertStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => String }) status: string,
  ): Promise<AlertEntity> {
    return this.alertsService.updateAlertStatus(id, status as AlertStatus);
  }
}
