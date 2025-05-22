// @ts-strict-mode: enabled
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int, Float, GraphQLISODateTime } from '@nestjs/graphql';
import { Order } from './order.entity';
import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * OrderItem entity
 *
 * Represents an individual product item within an order.
 * Each order item contains details about the product, variant, quantity, and pricing.
 */
@ObjectType('OrderItem')
@Entity('order_items')
// @Check("\"price\" >= 0") // Ensure prices are non-negative - commented out for testing
export class OrderItem {
  /**
   * Unique identifier for the order item
   */
  @Field(() => ID, { description: 'Unique order item identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  /**
   * Order ID foreign key
   * References the parent order this item belongs to
   */
  @Field(() => String, { description: 'Parent order ID' })
  @Column()
  @Index()
  @IsString()
  orderId: string = '';

  /**
   * Order relationship
   * The parent order this item belongs to
   */
  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  @ValidateNested()
  @Type(() => Order)
  order?: Order;

  /**
   * Product ID
   * References the product in the products table
   */
  @Field(() => String, { description: 'Product ID reference' })
  @Column()
  @Index()
  @IsString()
  productId: string = '';

  /**
   * Variant ID
   * References the specific product variant if applicable
   */
  @Field(() => String, { nullable: true, description: 'Product variant ID' })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  variantId?: string;

  /**
   * Item quantity
   * Number of units of this item in the order
   */
  @Field(() => Int, { description: 'Number of units ordered' })
  @Column('int')
  @IsNumber()
  @Min(1)
  quantity: number = 1;

  /**
   * Unit price
   * Price per unit of this item
   */
  @Field(() => Float, { description: 'Price per unit' })
  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  price: number = 0;

  /**
   * Product options
   * Array of option values for this product/variant
   */
  @Field(() => [String], { nullable: true, description: 'Product option values' })
  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  /**
   * Creation timestamp
   * When the order item was created
   */
  @Field(() => GraphQLISODateTime, { description: 'When the order item was created' })
  @CreateDateColumn()
  @IsDate()
  createdAt: Date = new Date();

  /**
   * Update timestamp
   * When the order item was last updated
   */
  @Field(() => GraphQLISODateTime, { description: 'When the order item was last updated' })
  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date = new Date();

  /**
   * Deletion timestamp
   * When the order item was soft-deleted (if applicable)
   */
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'When the order item was deleted',
  })
  @DeleteDateColumn()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}
