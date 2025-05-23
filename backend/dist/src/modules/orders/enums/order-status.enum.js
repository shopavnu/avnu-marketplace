"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["RETURNED"] = "returned";
    OrderStatus["REFUNDED"] = "refunded";
    OrderStatus["ON_HOLD"] = "on_hold";
    OrderStatus["FAILED"] = "failed";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
(0, graphql_1.registerEnumType)(OrderStatus, {
    name: 'OrderStatus',
    description: 'Possible statuses for an order throughout its lifecycle',
});
//# sourceMappingURL=order-status.enum.js.map