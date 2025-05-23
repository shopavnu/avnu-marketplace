import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddShopifyWebhookIndices1683675895000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private indexExists;
}
