// Production startup script with memory optimizations
const { spawn } = require('child_process');

// Set increased memory limit
process.env.NODE_OPTIONS = '--max-old-space-size=1024';

// Start the NestJS application
const nestProcess = spawn('node', ['dist/main.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Disable development features that may consume extra memory
    NODE_ENV: 'production',
    LOGGER_LEVEL: 'info', // Reduce logging verbosity
  }
});

nestProcess.on('close', (code) => {
  process.exit(code);
});
