import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = getRequestFromContext(context);
  return request.user;
});

// Helper function to extract request from different contexts
const getRequestFromContext = (context: ExecutionContext) => {
  const httpCtx = context.switchToHttp();
  if (httpCtx.getRequest()) {
    return httpCtx.getRequest();
  }

  const gqlCtx = GqlExecutionContext.create(context);
  if (gqlCtx.getContext().req) {
    return gqlCtx.getContext().req;
  }

  // Fallback or handle other contexts if necessary
  console.warn('CurrentUser decorator used in an unsupported context');
  return {}; // Return empty object or null if user cannot be determined
};
