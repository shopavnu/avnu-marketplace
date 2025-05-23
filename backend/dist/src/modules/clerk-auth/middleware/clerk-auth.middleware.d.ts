import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClerkAuthService } from '../clerk-auth.service';
export declare class ClerkAuthMiddleware implements NestMiddleware {
    private readonly clerkAuthService;
    constructor(clerkAuthService: ClerkAuthService);
    use(req: Request, res: Response, next: NextFunction): void;
}
