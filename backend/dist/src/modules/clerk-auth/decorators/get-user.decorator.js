"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUser = void 0;
const common_1 = require("@nestjs/common");
exports.GetUser = (0, common_1.createParamDecorator)((data, ctx) => {
    let request;
    if (ctx.getType() === 'http') {
        request = ctx.switchToHttp().getRequest();
    }
    else if (ctx.getType() === 'graphql') {
        const gqlContext = ctx.getArgByIndex(2);
        request = { auth: gqlContext?.auth };
    }
    else {
        return null;
    }
    const user = request.auth;
    if (!user) {
        return null;
    }
    if (data) {
        return user[data];
    }
    return user;
});
//# sourceMappingURL=get-user.decorator.js.map