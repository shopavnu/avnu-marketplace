import { ConfigService } from '@nestjs/config';
export declare class VendorConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    get documentsUploadDir(): string;
    get allowedDocumentTypes(): string[];
    get maxDocumentSizeBytes(): number;
    get applicationReviewTimeoutDays(): number;
    get defaultCommissionRate(): number;
}
