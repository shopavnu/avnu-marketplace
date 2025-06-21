import { execSync } from 'child_process';

/**
 * Jest global setup that ensures a Prisma Client is generated before any test
 * suites are executed. This prevents runtime errors like:
 *   "@prisma/client did not initialize yet. Please run \"prisma generate\""
 * which occur in fresh CI environments or when migrations are applied just
 * before tests.
 */
module.exports = async () => {
  try {
    execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to run prisma generate during Jest globalSetup', err);
    throw err;
  }
};
