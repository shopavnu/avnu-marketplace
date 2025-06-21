const { execSync } = require('child_process');

module.exports = async () => {
  try {
    execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', { stdio: 'inherit', cwd: __dirname });
    execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to run prisma generate during Jest globalSetup', err);
    throw err;
  }
};
