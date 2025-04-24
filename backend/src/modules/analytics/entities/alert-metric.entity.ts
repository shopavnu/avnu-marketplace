import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
// Removed unused imports from '@nestjs/common'
import { AlertEntity } from './alert.entity';

@ObjectType('AlertMetric')
@Entity('alert_metrics')
export class AlertMetricEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Field(() => Float)
  @Column({ type: 'float' })
  value: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  previousValue: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  changePercentage: number;

  @Field(() => Float)
  @Column({ type: 'float' })
  threshold: number;

  @ManyToOne(() => AlertEntity, alert => alert.metrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alert_id' })
  alert: AlertEntity;
}
