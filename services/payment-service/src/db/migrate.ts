import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../config/db.config';
import { logger } from '../config/logger.config';

async function runMigrations() {
  try {
    logger.info('🔄 Starting database migrations...');
    await migrate(db, { migrationsFolder: 'drizzle' });
    logger.info('✅ Database migrations completed successfully');
  } catch (error) {
    logger.error('❌ Database migration failed:', { error });
    process.exit(1);
  }
}

runMigrations();
