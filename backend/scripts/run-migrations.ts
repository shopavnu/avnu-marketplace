import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { CreateUserPreferenceProfile1714414890000 } from '../src/migrations/1714414890000-CreateUserPreferenceProfile';

// Load environment variables
config();

// Create a new data source
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'avnu_marketplace',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [CreateUserPreferenceProfile1714414890000],
  synchronize: false,
});

async function runMigrations() {
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Run migrations
    console.log('Running migrations...');
    await AppDataSource.runMigrations();
    console.log('Migrations completed successfully!');

    // Close the connection
    await AppDataSource.destroy();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations();
