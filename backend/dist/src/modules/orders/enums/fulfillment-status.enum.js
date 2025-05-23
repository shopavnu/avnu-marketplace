"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var FulfillmentStatus;
(function (FulfillmentStatus) {
    FulfillmentStatus["UNFULFILLED"] = "unfulfilled";
    FulfillmentStatus["PARTIALLY_FULFILLED"] = "partially_fulfilled";
    FulfillmentStatus["FULFILLED"] = "fulfilled";
    FulfillmentStatus["PROCESSING"] = "processing";
    FulfillmentStatus["CANCELLED"] = "cancelled";
    FulfillmentStatus["FAILED"] = "failed";
})(FulfillmentStatus || (exports.FulfillmentStatus = FulfillmentStatus = {}));
(0, graphql_1.registerEnumType)(FulfillmentStatus, {
    name: 'FulfillmentStatus',
    description: 'Possible fulfillment statuses for an order',
});
//# sourceMappingURL=fulfillment-status.enum.js.map