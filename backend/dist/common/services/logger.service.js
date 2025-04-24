"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = exports.LogLevel = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
let LoggerService = class LoggerService {
    constructor(configService) {
        this.configService = configService;
        const configLogLevel = this.configService.get('LOG_LEVEL', 'info').toLowerCase();
        switch (configLogLevel) {
            case 'error':
                this.logLevel = LogLevel.ERROR;
                break;
            case 'warn':
                this.logLevel = LogLevel.WARN;
                break;
            case 'info':
                this.logLevel = LogLevel.INFO;
                break;
            case 'debug':
                this.logLevel = LogLevel.DEBUG;
                break;
            default:
                this.logLevel = LogLevel.INFO;
        }
    }
    setContext(context) {
        this.context = context;
        return this;
    }
    error(message, trace, context) {
        if (this.logLevel >= LogLevel.ERROR) {
            const currentContext = context || this.context;
            const timestamp = new Date().toISOString();
            console.error(JSON.stringify({
                level: 'error',
                context: currentContext,
                timestamp,
                message: this.formatMessage(message),
                trace,
            }));
        }
    }
    warn(message, context) {
        if (this.logLevel >= LogLevel.WARN) {
            const currentContext = context || this.context;
            const timestamp = new Date().toISOString();
            console.warn(JSON.stringify({
                level: 'warn',
                context: currentContext,
                timestamp,
                message: this.formatMessage(message),
            }));
        }
    }
    log(message, context) {
        if (this.logLevel >= LogLevel.INFO) {
            const currentContext = context || this.context;
            const timestamp = new Date().toISOString();
            console.log(JSON.stringify({
                level: 'info',
                context: currentContext,
                timestamp,
                message: this.formatMessage(message),
            }));
        }
    }
    debug(message, context) {
        if (this.logLevel >= LogLevel.DEBUG) {
            const currentContext = context || this.context;
            const timestamp = new Date().toISOString();
            console.debug(JSON.stringify({
                level: 'debug',
                context: currentContext,
                timestamp,
                message: this.formatMessage(message),
            }));
        }
    }
    verbose(message, context) {
        this.debug(message, context);
    }
    formatMessage(message) {
        if (typeof message === 'object') {
            try {
                return JSON.stringify(message);
            }
            catch (e) {
                return `[Object] ${message}`;
            }
        }
        return message;
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT }),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LoggerService);
//# sourceMappingURL=logger.service.js.map