import { Injectable } from '@nestjs/common';
import { QueryRunner, DataSource } from 'typeorm';

/**
 * Service to manage database transactions
 */
@Injectable()
export class TransactionService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Start a transaction
   * @returns QueryRunner with active transaction
   */
  async startTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  /**
   * Commit a transaction
   * @param queryRunner - QueryRunner with active transaction
   */
  async commitTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.release();
  }

  /**
   * Rollback a transaction
   * @param queryRunner - QueryRunner with active transaction
   */
  async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }

  /**
   * Execute a function within a transaction
   * @param callback - Function to execute within transaction
   * @returns Result of the callback function
   */
  async executeInTransaction<T>(callback: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = await this.startTransaction();

    try {
      const result = await callback(queryRunner);
      await this.commitTransaction(queryRunner);
      return result;
    } catch (error) {
      await this.rollbackTransaction(queryRunner);
      throw error;
    }
  }
}
