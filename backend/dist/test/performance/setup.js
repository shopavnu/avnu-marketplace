'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const perf_hooks_1 = require('perf_hooks');
expect.extend({
  toBeUnderPerformanceThreshold(received, threshold) {
    const pass = received <= threshold;
    return {
      message: () =>
        `Expected execution time ${received}ms to ${pass ? 'not ' : ''}be under threshold ${threshold}ms`,
      pass,
    };
  },
});
beforeEach(() => {
  perf_hooks_1.performance.clearMarks();
  perf_hooks_1.performance.clearMeasures();
});
//# sourceMappingURL=setup.js.map
