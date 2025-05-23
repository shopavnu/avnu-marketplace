"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, context) => {
    const request = getRequestFromContext(context);
    return request.user;
});
const getRequestFromContext = (context) => {
    const httpCtx = context.switchToHttp();
    if (httpCtx.getRequest()) {
        return httpCtx.getRequest();
    }
    const gqlCtx = graphql_1.GqlExecutionContext.create(context);
    if (gqlCtx.getContext().req) {
        return gqlCtx.getContext().req;
    }
    console.warn('CurrentUser decorator used in an unsupported context');
    return {};
};
//# sourceMappingURL=current-user.decorator.js.map