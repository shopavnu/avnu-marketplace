import { QueryRunner, DataSource } from 'typeorm';
export declare class TransactionService {
  private readonly dataSource;
  constructor(dataSource: DataSource);
  startTransaction(): Promise<QueryRunner>;
  commitTransaction(queryRunner: QueryRunner): Promise<void>;
  rollbackTransaction(queryRunner: QueryRunner): Promise<void>;
  executeInTransaction<T>(callback: (queryRunner: QueryRunner) => Promise<T>): Promise<T>;
}
