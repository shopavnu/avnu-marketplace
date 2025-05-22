'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ABTestingService = void 0;
const common_1 = require('@nestjs/common');
let ABTestingService = class ABTestingService {
  constructor() {}
  async getABTestResults() {
    return [
      {
        id: 'test-1',
        name: 'Product Card Layout',
        description: 'Testing vertical consistency in product cards vs. original layout',
        status: 'running',
        startDate: '2025-04-10',
        variants: [
          {
            id: 'control',
            name: 'Original Layout',
            description: 'Current product card implementation',
            trafficPercentage: 50,
            isControl: true,
          },
          {
            id: 'variant-1',
            name: 'Vertical Consistent Layout',
            description: 'Fixed height product cards with consistent vertical alignment',
            trafficPercentage: 50,
            isControl: false,
          },
        ],
        metrics: [
          {
            name: 'Conversion Rate (%)',
            control: 3.2,
            variants: [
              {
                id: 'variant-1',
                value: 4.1,
                improvement: 28.1,
              },
            ],
          },
          {
            name: 'Click-Through Rate (%)',
            control: 12.5,
            variants: [
              {
                id: 'variant-1',
                value: 15.8,
                improvement: 26.4,
              },
            ],
          },
        ],
      },
      {
        id: 'test-2',
        name: 'Personalized Search Results',
        description: 'Testing personalized search results vs. standard relevance-based results',
        status: 'completed',
        startDate: '2025-03-01',
        endDate: '2025-03-28',
        variants: [
          {
            id: 'control',
            name: 'Standard Search',
            description: 'Relevance-based search results',
            trafficPercentage: 50,
            isControl: true,
          },
          {
            id: 'variant-1',
            name: 'Personalized Search',
            description: 'Search results influenced by user behavior and preferences',
            trafficPercentage: 50,
            isControl: false,
          },
        ],
        metrics: [
          {
            name: 'Conversion Rate (%)',
            control: 2.8,
            variants: [
              {
                id: 'variant-1',
                value: 4.3,
                improvement: 53.6,
              },
            ],
          },
          {
            name: 'Click-Through Rate (%)',
            control: 10.2,
            variants: [
              {
                id: 'variant-1',
                value: 18.7,
                improvement: 83.3,
              },
            ],
          },
        ],
        winner: 'variant-1',
        confidenceLevel: 98.5,
      },
    ];
  }
};
exports.ABTestingService = ABTestingService;
exports.ABTestingService = ABTestingService = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [])],
  ABTestingService,
);
//# sourceMappingURL=ab-testing.service.js.map
