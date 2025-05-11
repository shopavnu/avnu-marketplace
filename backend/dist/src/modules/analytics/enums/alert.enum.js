'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AlertStatus = exports.AlertSeverity = exports.AlertType = void 0;
const graphql_1 = require('@nestjs/graphql');
var AlertType;
(function (AlertType) {
  AlertType['PERSONALIZATION_DROP'] = 'PERSONALIZATION_DROP';
  AlertType['UNUSUAL_PATTERN'] = 'UNUSUAL_PATTERN';
  AlertType['AB_TEST_RESULT'] = 'AB_TEST_RESULT';
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
  AlertSeverity['HIGH'] = 'HIGH';
  AlertSeverity['MEDIUM'] = 'MEDIUM';
  AlertSeverity['LOW'] = 'LOW';
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertStatus;
(function (AlertStatus) {
  AlertStatus['ACTIVE'] = 'ACTIVE';
  AlertStatus['ACKNOWLEDGED'] = 'ACKNOWLEDGED';
  AlertStatus['RESOLVED'] = 'RESOLVED';
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
(0, graphql_1.registerEnumType)(AlertType, {
  name: 'AlertType',
  description: 'Type of alert',
});
(0, graphql_1.registerEnumType)(AlertSeverity, {
  name: 'AlertSeverity',
  description: 'Severity level of alert',
});
(0, graphql_1.registerEnumType)(AlertStatus, {
  name: 'AlertStatus',
  description: 'Status of alert',
});
//# sourceMappingURL=alert.enum.js.map
