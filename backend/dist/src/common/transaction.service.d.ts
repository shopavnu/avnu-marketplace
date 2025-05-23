import { DataSource, EntityManager, QueryRunner } from 'typeorm';
export declare class TransactionService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    executeInTransaction<T>(callback: (entityManager: EntityManager) => Promise<T>): Promise<T>;
    createTransaction(): Promise<QueryRunner>;
}
