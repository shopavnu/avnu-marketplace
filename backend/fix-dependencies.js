const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running dependency fix script...');

// Check if bullmq exists in node_modules
const rootNodeModules = '/opt/render/project/src/node_modules';
const bullmqPath = path.join(rootNodeModules, 'bullmq');

if (!fs.existsSync(bullmqPath)) {
  console.log('bullmq not found in root node_modules, installing...');
  try {
    // Install bullmq at the root level
    execSync('npm install bullmq@5.53.0 @bull-board/api @bull-board/nestjs', {
      cwd: '/opt/render/project/src',
      stdio: 'inherit'
    });
    console.log('Successfully installed bullmq and bull-board packages at root level');
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

console.log('Dependency check complete');
