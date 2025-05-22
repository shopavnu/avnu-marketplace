import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SessionEntity } from './session.entity';
import { SessionInteractionType } from '../enums/session-interaction-type.enum';

/**
 * Entity for tracking detailed user interactions within a session
 */
@Entity('session_interactions')
export class SessionInteractionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SessionEntity, session => session.interactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: SessionEntity;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: SessionInteractionType;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'integer', nullable: true })
  durationMs?: number;

  @CreateDateColumn()
  createdAt: Date;
}
