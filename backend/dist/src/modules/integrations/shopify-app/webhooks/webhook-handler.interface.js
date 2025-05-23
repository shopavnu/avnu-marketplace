"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseWebhookHandler = void 0;
class BaseWebhookHandler {
    constructor(topics) {
        this.topics = topics;
    }
    getTopics() {
        return this.topics;
    }
    createSuccessResult(message, data) {
        return {
            success: true,
            message: message || `Successfully processed webhook`,
            data,
        };
    }
    createErrorResult(error, message) {
        return {
            success: false,
            message: message || `Error processing webhook`,
            error,
        };
    }
}
exports.BaseWebhookHandler = BaseWebhookHandler;
//# sourceMappingURL=webhook-handler.interface.js.map