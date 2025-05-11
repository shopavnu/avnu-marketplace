'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PaymentStatus = void 0;
const graphql_1 = require('@nestjs/graphql');
var PaymentStatus;
(function (PaymentStatus) {
  PaymentStatus['PENDING'] = 'pending';
  PaymentStatus['PROCESSING'] = 'processing';
  PaymentStatus['COMPLETED'] = 'completed';
  PaymentStatus['FAILED'] = 'failed';
  PaymentStatus['REFUNDED'] = 'refunded';
  PaymentStatus['PARTIALLY_REFUNDED'] = 'partially_refunded';
  PaymentStatus['ON_HOLD'] = 'on_hold';
  PaymentStatus['CANCELLED'] = 'cancelled';
  PaymentStatus['AWAITING_CONFIRMATION'] = 'awaiting_confirmation';
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
(0, graphql_1.registerEnumType)(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Possible payment statuses for an order',
});
//# sourceMappingURL=payment-status.enum.js.map
