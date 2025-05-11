import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entity to store metadata about application and document reviews
 */
@Entity()
export class ReviewMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID of the admin who performed the review
   */
  @Column()
  adminId: string;

  /**
   * Optional notes about the review
   */
  @Column({ nullable: true, type: 'text' })
  notes?: string;

  /**
   * Optional reason for rejection
   */
  @Column({ nullable: true, type: 'text' })
  rejectionReason?: string;

  /**
   * Timestamp of when the review was performed
   */
  @CreateDateColumn()
  reviewedAt: Date;

  /**
   * Relation ID for the entity being reviewed (application or document)
   */
  @Column({ name: 'entity_id' })
  entityId: string;

  /**
   * Type of entity being reviewed (application or document)
   */
  @Column({ name: 'entity_type' })
  entityType: string;

  /**
   * Status applied during this review
   */
  @Column()
  status: string;
}
