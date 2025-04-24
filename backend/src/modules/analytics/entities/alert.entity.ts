import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
// Removed unused imports from '@nestjs/common'
import { AlertStatus, AlertType, AlertSeverity } from '../enums/alert.enum';
import { AlertMetricEntity } from './alert-metric.entity';
import { UserSegmentEntity } from '../../users/entities/user-segment.entity';

@ObjectType('Alert')
@Entity('alerts')
export class AlertEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Field()
  @Column({ type: 'text' })
  description: string;

  @Field()
  @Column({
    type: 'enum',
    enum: AlertType,
    default: AlertType.PERSONALIZATION_DROP,
  })
  type: AlertType;

  @Field()
  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.MEDIUM,
  })
  severity: AlertSeverity;

  @Field()
  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status: AlertStatus;

  @Field(() => [AlertMetricEntity], { nullable: true })
  @OneToMany(() => AlertMetricEntity, metric => metric.alert, {
    cascade: true,
    eager: true,
  })
  metrics: AlertMetricEntity[];

  @Field(() => [UserSegmentEntity], { nullable: true })
  @ManyToMany(() => UserSegmentEntity)
  @JoinTable({
    name: 'alert_affected_segments',
    joinColumn: { name: 'alert_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'segment_id', referencedColumnName: 'id' },
  })
  affectedSegments: UserSegmentEntity[];

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
