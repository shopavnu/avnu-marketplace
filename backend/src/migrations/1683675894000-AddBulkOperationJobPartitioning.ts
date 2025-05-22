import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add partitioning to the shopify_bulk_operation_jobs table
 *
 * This migration:
 * 1. Adds PostgreSQL table partitioning by merchant_id
 * 2. Creates initial partitions for the table
 * 3. Sets up partition maintenance
 */
export class AddBulkOperationJobPartitioning1683675894000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, we need to create a temporary table to hold existing data (if any)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shopify_bulk_operation_jobs_temp AS 
      SELECT * FROM shopify_bulk_operation_jobs;
    `);

    // Drop existing table
    await queryRunner.query(`
      DROP TABLE IF EXISTS shopify_bulk_operation_jobs CASCADE;
    `);

    // Create a new partitioned table
    await queryRunner.query(`
      CREATE TABLE shopify_bulk_operation_jobs (
        id UUID PRIMARY KEY,
        merchant_id VARCHAR NOT NULL,
        shopify_bulk_operation_id VARCHAR NOT NULL,
        description VARCHAR NOT NULL,
        query TEXT,
        status VARCHAR NOT NULL,
        status_message VARCHAR,
        error_code VARCHAR,
        error_details TEXT,
        result_url VARCHAR,
        partial_result_url VARCHAR,
        object_count INT DEFAULT 0,
        file_size INT DEFAULT 0,
        completed_at TIMESTAMP,
        retry_count INT DEFAULT 0,
        progress_percentage INT DEFAULT 0,
        metadata JSONB,
        connection_id UUID,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      ) PARTITION BY HASH (merchant_id);
    `);

    // Create index on merchant_id
    await queryRunner.query(`
      CREATE INDEX idx_shopify_bulk_operation_jobs_merchant_id 
      ON shopify_bulk_operation_jobs (merchant_id);
    `);

    // Create index on status for faster job status lookups
    await queryRunner.query(`
      CREATE INDEX idx_shopify_bulk_operation_jobs_status
      ON shopify_bulk_operation_jobs (status);
    `);

    // Create index on updated_at for faster stalled job detection
    await queryRunner.query(`
      CREATE INDEX idx_shopify_bulk_operation_jobs_updated_at
      ON shopify_bulk_operation_jobs (updated_at);
    `);

    // Create 8 hash partitions - this is a good starting point and can be adjusted
    for (let i = 0; i < 8; i++) {
      await queryRunner.query(`
        CREATE TABLE shopify_bulk_operation_jobs_p${i} 
        PARTITION OF shopify_bulk_operation_jobs
        FOR VALUES WITH (MODULUS 8, REMAINDER ${i});
      `);
    }

    // Restore existing data
    await queryRunner.query(`
      INSERT INTO shopify_bulk_operation_jobs 
      SELECT * FROM shopify_bulk_operation_jobs_temp;
    `);

    // Drop the temporary table
    await queryRunner.query(`
      DROP TABLE shopify_bulk_operation_jobs_temp;
    `);

    // Set up a helper function for partition maintenance
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION maintain_shopify_bulk_operation_partitions()
      RETURNS void AS $$
      DECLARE
          partition_count INTEGER := 8;
          oldest_partition INTEGER;
          newest_partition INTEGER;
          current_merchant_count INTEGER;
          merchants_per_partition INTEGER;
      BEGIN
          -- Get count of distinct merchants
          SELECT COUNT(DISTINCT merchant_id) INTO current_merchant_count 
          FROM shopify_bulk_operation_jobs;
          
          -- Calculate optimal merchants per partition
          merchants_per_partition := GREATEST(100, current_merchant_count / partition_count);
          
          -- Get current partition range
          SELECT MIN(SUBSTRING(partition_name FROM 'shopify_bulk_operation_jobs_p(.*)$')::INTEGER),
                 MAX(SUBSTRING(partition_name FROM 'shopify_bulk_operation_jobs_p(.*)$')::INTEGER)
          INTO oldest_partition, newest_partition
          FROM pg_catalog.pg_tables 
          WHERE tablename LIKE 'shopify_bulk_operation_jobs_p%';
          
          -- If we're approaching the threshold, create new partitions
          IF current_merchant_count > merchants_per_partition * newest_partition THEN
              FOR i IN newest_partition + 1 .. newest_partition + 4 LOOP
                  EXECUTE 'CREATE TABLE IF NOT EXISTS shopify_bulk_operation_jobs_p' || i || 
                          ' PARTITION OF shopify_bulk_operation_jobs FOR VALUES WITH (MODULUS ' || 
                          (partition_count + i - oldest_partition) || ', REMAINDER ' || i || ')';
              END LOOP;
          END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create a periodic job to maintain partitions
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pg_cron;
      
      SELECT cron.schedule('0 0 * * 0', $$
        SELECT maintain_shopify_bulk_operation_partitions();
      $$, 'Maintain Shopify bulk operation job partitions');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the partitioned table
    await queryRunner.query(`
      DROP TABLE IF EXISTS shopify_bulk_operation_jobs CASCADE;
    `);

    // Remove the maintenance function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS maintain_shopify_bulk_operation_partitions();
    `);

    // Remove the cron job
    await queryRunner.query(`
      SELECT cron.unschedule('Maintain Shopify bulk operation job partitions');
    `);

    // Recreate the original table structure
    await queryRunner.query(`
      CREATE TABLE shopify_bulk_operation_jobs (
        id UUID PRIMARY KEY,
        merchant_id VARCHAR NOT NULL,
        shopify_bulk_operation_id VARCHAR NOT NULL,
        description VARCHAR NOT NULL,
        query TEXT,
        status VARCHAR NOT NULL,
        status_message VARCHAR,
        error_code VARCHAR,
        error_details TEXT,
        result_url VARCHAR,
        partial_result_url VARCHAR,
        object_count INT DEFAULT 0,
        file_size INT DEFAULT 0,
        completed_at TIMESTAMP,
        retry_count INT DEFAULT 0,
        progress_percentage INT DEFAULT 0,
        metadata JSONB,
        connection_id UUID,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
      
      CREATE INDEX idx_shopify_bulk_operation_jobs_merchant_id 
      ON shopify_bulk_operation_jobs (merchant_id);
      
      CREATE INDEX idx_shopify_bulk_operation_jobs_status
      ON shopify_bulk_operation_jobs (status);
    `);
  }
}
