import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClerkAuthService } from '../clerk-auth.service';

@Injectable()
export class ClerkAuthMiddleware implements NestMiddleware {
  constructor(private readonly clerkAuthService: ClerkAuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Use the Clerk middleware to attach auth to the request
    const clerkMiddleware = this.clerkAuthService.getClerkMiddleware();
    clerkMiddleware(req, res, next);
  }
}
