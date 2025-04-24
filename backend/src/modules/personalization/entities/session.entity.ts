import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
// Import will be resolved once the file is created
import { SessionInteractionEntity } from './session-interaction.entity';

/**
 * Entity for tracking user sessions
 */
@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sessionId: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  lastActivityTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo?: Record<string, any>;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ type: 'jsonb', default: [] })
  searchQueries: string[];

  @Column({ type: 'jsonb', default: [] })
  clickedResults: string[];

  @Column({ type: 'jsonb', default: [] })
  viewedCategories: string[];

  @Column({ type: 'jsonb', default: [] })
  viewedBrands: string[];

  @Column({ type: 'jsonb', default: [] })
  filters: Record<string, any>[];

  @Column({ nullable: true })
  userId?: string;

  @OneToMany(() => SessionInteractionEntity, interaction => interaction.session, { eager: false })
  interactions: SessionInteractionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
