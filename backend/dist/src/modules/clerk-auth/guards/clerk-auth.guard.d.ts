import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClerkAuthService } from '../clerk-auth.service';
import { Reflector } from '@nestjs/core';
export declare class ClerkAuthGuard implements CanActivate {
    private clerkAuthService;
    private reflector;
    constructor(clerkAuthService: ClerkAuthService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
