import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddPostgresSpecificIndexes1714437666000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
