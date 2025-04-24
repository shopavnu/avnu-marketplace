import { performance } from 'perf_hooks';

// Extend Jest with custom matchers for performance testing
expect.extend({
  toBeUnderPerformanceThreshold(received: number, threshold: number) {
    const pass = received <= threshold;
    return {
      message: () =>
        `Expected execution time ${received}ms to ${
          pass ? 'not ' : ''
        }be under threshold ${threshold}ms`,
      pass,
    };
  },
});

// Global setup for performance tests
beforeEach(() => {
  // Reset performance marks
  performance.clearMarks();
  performance.clearMeasures();
});

// Add custom types for our performance matchers
// This approach avoids using namespace syntax which is discouraged by ESLint

// Add the matcher to the global Jest namespace without using the namespace keyword
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeUnderPerformanceThreshold(threshold: number): R;
    }
  }
}
