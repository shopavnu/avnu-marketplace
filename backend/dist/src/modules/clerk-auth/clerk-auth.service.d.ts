import { ConfigService } from '@nestjs/config';
export declare class ClerkAuthService {
    private configService;
    private clerk;
    private verifyToken;
    constructor(configService: ConfigService);
    getClerkMiddleware(): import("@clerk/clerk-sdk-node/dist/types/types").MiddlewareWithAuthProp;
    getRequireAuthMiddleware(): import("@clerk/clerk-sdk-node/dist/types/types").MiddlewareRequireAuthProp;
    verifySessionToken(token: string): Promise<any>;
    getUser(userId: string): Promise<import("@clerk/clerk-sdk-node").User>;
}
