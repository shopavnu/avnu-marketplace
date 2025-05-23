import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    let request;
    
    if (ctx.getType() === 'http') {
      request = ctx.switchToHttp().getRequest();
    } else if (ctx.getType() === 'graphql' as any) {
      const gqlContext = ctx.getArgByIndex(2); // GraphQL context is the 3rd argument
      request = { auth: gqlContext?.auth };
    } else {
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
  },
);
