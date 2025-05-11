import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add additional indices and optimizations for Shopify webhook processing
 *
 * This migration:
 * 1. Adds indices to the shopify_webhooks table
 * 2. Adds indices to the shopify_webhook_logs table
 * 3. Creates a new partitioned shopify_webhook_logs table by date
 * 4. Sets up automatic partition management for logs
 */
export class AddShopifyWebhookIndices1683675895000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add indices to the shopify_webhooks table (if it exists)
    // First check if the table exists before adding indices
    const webhooksTableExists = await queryRunner.hasTable('shopify_webhooks');
    if (webhooksTableExists) {
      // Check if indices already exist before creating them
      const topicIndexExists = await this.indexExists(queryRunner, 'idx_shopify_webhooks_topic');
      const shopIndexExists = await this.indexExists(queryRunner, 'idx_shopify_webhooks_shop');
      const processedAtIndexExists = await this.indexExists(
        queryRunner,
        'idx_shopify_webhooks_processed_at',
      );

      // Create indices if they don't exist
      if (!topicIndexExists) {
        await queryRunner.query(`
          CREATE INDEX idx_shopify_webhooks_topic ON shopify_webhooks (topic);
        `);
      }

      if (!shopIndexExists) {
        await queryRunner.query(`
          CREATE INDEX idx_shopify_webhooks_shop ON shopify_webhooks (shop_domain);
        `);
      }

      if (!processedAtIndexExists) {
        await queryRunner.query(`
          CREATE INDEX idx_shopify_webhooks_processed_at ON shopify_webhooks (processed_at);
        `);
      }

      // Create a compound index for faster webhook processing
      const compoundIndexExists = await this.indexExists(
        queryRunner,
        'idx_shopify_webhooks_shop_topic',
      );
      if (!compoundIndexExists) {
        await queryRunner.query(`
          CREATE INDEX idx_shopify_webhooks_shop_topic ON shopify_webhooks (shop_domain, topic);
        `);
      }
    }

    // Step 2: Create or modify the shopify_webhook_logs table with partitioning
    const logsTableExists = await queryRunner.hasTable('shopify_webhook_logs');

    if (logsTableExists) {
      // Create a temporary table to hold existing data
      await queryRunner.query(`
        CREATE TABLE shopify_webhook_logs_temp AS SELECT * FROM shopify_webhook_logs;
      `);

      // Drop existing table
      await queryRunner.query(`
        DROP TABLE shopify_webhook_logs;
      `);
    }

    // Create a new partitioned table for webhook logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shopify_webhook_logs (
        id UUID PRIMARY KEY,
        webhook_id VARCHAR NOT NULL,
        shop_domain VARCHAR NOT NULL,
        topic VARCHAR NOT NULL,
        processed_successfully BOOLEAN DEFAULT false,
        error_message TEXT,
        processing_time_ms INTEGER,
        received_at TIMESTAMP NOT NULL,
        processed_at TIMESTAMP,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      ) PARTITION BY RANGE (received_at);
    `);

    // Create indices on the partitioned table
    await queryRunner.query(`
      CREATE INDEX idx_shopify_webhook_logs_shop_domain ON shopify_webhook_logs (shop_domain);
      CREATE INDEX idx_shopify_webhook_logs_topic ON shopify_webhook_logs (topic);
      CREATE INDEX idx_shopify_webhook_logs_received_at ON shopify_webhook_logs (received_at);
      CREATE INDEX idx_shopify_webhook_logs_processed_successfully ON shopify_webhook_logs (processed_successfully);
    `);

    // Create initial partitions for the last 3 months, current month, and next month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Create partitions for the last 3 months
    for (let i = 3; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentYear - Math.floor((currentMonth - i + 12) / 12);

      const nextMonth = (month + 1) % 12;
      const nextYear = month === 11 ? year + 1 : year;

      // Format date strings for partition
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`;

      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS shopify_webhook_logs_${year}_${String(month + 1).padStart(2, '0')}
        PARTITION OF shopify_webhook_logs
        FOR VALUES FROM ('${startDate}') TO ('${endDate}');
      `);
    }

    // Create partition for next month
    const nextMonth = (currentMonth + 1) % 12;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nextNextMonth = (nextMonth + 1) % 12;
    const nextNextYear = nextMonth === 11 ? nextYear + 1 : nextYear;

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shopify_webhook_logs_${nextYear}_${String(nextMonth + 1).padStart(2, '0')}
      PARTITION OF shopify_webhook_logs
      FOR VALUES FROM ('${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01') 
      TO ('${nextNextYear}-${String(nextNextMonth + 1).padStart(2, '0')}-01');
    `);

    // Restore data if the table previously existed
    if (logsTableExists) {
      await queryRunner.query(`
        INSERT INTO shopify_webhook_logs SELECT * FROM shopify_webhook_logs_temp;
        DROP TABLE shopify_webhook_logs_temp;
      `);
    }

    // Create a function to automatically create new partitions
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION create_webhook_log_partition_for_month()
      RETURNS void AS $$
      DECLARE
        year_month TEXT;
        next_year_month TEXT;
      BEGIN
        -- Calculate the month after next month
        year_month := to_char(date_trunc('month', now()) + interval '2 month', 'YYYY_MM');
        next_year_month := to_char(date_trunc('month', now()) + interval '3 month', 'YYYY_MM');
        
        -- Check if partition exists and create if it doesn't
        IF NOT EXISTS (
          SELECT 1 FROM pg_tables 
          WHERE tablename = 'shopify_webhook_logs_' || year_month
        ) THEN
          EXECUTE 'CREATE TABLE shopify_webhook_logs_' || year_month || 
                  ' PARTITION OF shopify_webhook_logs' ||
                  ' FOR VALUES FROM (''' || to_char(date_trunc('month', now()) + interval '2 month', 'YYYY-MM-DD') || ''')' ||
                  ' TO (''' || to_char(date_trunc('month', now()) + interval '3 month', 'YYYY-MM-DD') || ''')';
                  
          RAISE NOTICE 'Created new partition shopify_webhook_logs_%', year_month;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Schedule monthly partition creation
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pg_cron;
      
      SELECT cron.schedule('0 0 1 * *', $$
        SELECT create_webhook_log_partition_for_month();
      $$, 'Create webhook log partition for next month');
    `);

    // Create a function to clean up old partitions (keep 12 months by default)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_webhook_log_partitions(months_to_keep INTEGER DEFAULT 12)
      RETURNS void AS $$
      DECLARE
        partition_name TEXT;
        partition_date DATE;
        cutoff_date DATE;
      BEGIN
        cutoff_date := date_trunc('month', now() - (months_to_keep || ' months')::interval);
        
        FOR partition_name IN
          SELECT tablename 
          FROM pg_tables 
          WHERE tablename LIKE 'shopify_webhook_logs_%'
        LOOP
          BEGIN
            -- Extract date from partition name (format: shopify_webhook_logs_YYYY_MM)
            partition_date := to_date(
              substring(partition_name from 'shopify_webhook_logs_([0-9]{4}_[0-9]{2})$'),
              'YYYY_MM'
            );
            
            -- Drop partitions older than cutoff date
            IF partition_date < cutoff_date THEN
              EXECUTE 'DROP TABLE IF EXISTS ' || partition_name;
              RAISE NOTICE 'Dropped old partition %', partition_name;
            END IF;
          EXCEPTION
            WHEN OTHERS THEN
              RAISE NOTICE 'Error processing partition %: %', partition_name, SQLERRM;
              -- Continue with next partition
          END;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Schedule quarterly cleanup of old partitions
    await queryRunner.query(`
      SELECT cron.schedule('0 0 1 */3 *', $$
        SELECT cleanup_old_webhook_log_partitions(12);
      $$, 'Cleanup old webhook log partitions');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indices from shopify_webhooks table
    const webhooksTableExists = await queryRunner.hasTable('shopify_webhooks');
    if (webhooksTableExists) {
      await queryRunner.query(`
        DROP INDEX IF EXISTS idx_shopify_webhooks_topic;
        DROP INDEX IF EXISTS idx_shopify_webhooks_shop;
        DROP INDEX IF EXISTS idx_shopify_webhooks_processed_at;
        DROP INDEX IF EXISTS idx_shopify_webhooks_shop_topic;
      `);
    }

    // Create a temporary table to hold existing webhook logs data
    const logsTableExists = await queryRunner.hasTable('shopify_webhook_logs');
    if (logsTableExists) {
      await queryRunner.query(`
        CREATE TABLE shopify_webhook_logs_temp AS SELECT * FROM shopify_webhook_logs;
        DROP TABLE shopify_webhook_logs CASCADE;
      `);

      // Recreate the table without partitioning
      await queryRunner.query(`
        CREATE TABLE shopify_webhook_logs (
          id UUID PRIMARY KEY,
          webhook_id VARCHAR NOT NULL,
          shop_domain VARCHAR NOT NULL,
          topic VARCHAR NOT NULL,
          processed_successfully BOOLEAN DEFAULT false,
          error_message TEXT,
          processing_time_ms INTEGER,
          received_at TIMESTAMP NOT NULL,
          processed_at TIMESTAMP,
          metadata JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT now()
        );
        
        CREATE INDEX idx_shopify_webhook_logs_shop_domain ON shopify_webhook_logs (shop_domain);
        CREATE INDEX idx_shopify_webhook_logs_topic ON shopify_webhook_logs (topic);
        CREATE INDEX idx_shopify_webhook_logs_received_at ON shopify_webhook_logs (received_at);
      `);

      // Restore data
      await queryRunner.query(`
        INSERT INTO shopify_webhook_logs SELECT * FROM shopify_webhook_logs_temp;
        DROP TABLE shopify_webhook_logs_temp;
      `);
    }

    // Drop partition management functions
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS create_webhook_log_partition_for_month();
      DROP FUNCTION IF EXISTS cleanup_old_webhook_log_partitions(INTEGER);
    `);

    // Drop cron jobs
    await queryRunner.query(`
      SELECT cron.unschedule('Create webhook log partition for next month');
      SELECT cron.unschedule('Cleanup old webhook log partitions');
    `);
  }

  // Helper method to check if an index exists
  private async indexExists(queryRunner: QueryRunner, indexName: string): Promise<boolean> {
    const result = await queryRunner.query(
      `SELECT COUNT(*) as count FROM pg_indexes WHERE indexname = $1`,
      [indexName],
    );
    return result[0].count > 0;
  }
}
