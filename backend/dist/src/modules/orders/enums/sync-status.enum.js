"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "pending";
    SyncStatus["SYNCED"] = "synced";
    SyncStatus["FAILED"] = "failed";
    SyncStatus["OUT_OF_SYNC"] = "out_of_sync";
    SyncStatus["SYNCING"] = "syncing";
    SyncStatus["NOT_REQUIRED"] = "not_required";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
(0, graphql_1.registerEnumType)(SyncStatus, {
    name: 'SyncStatus',
    description: 'Possible synchronization statuses for an order',
});
//# sourceMappingURL=sync-status.enum.js.map