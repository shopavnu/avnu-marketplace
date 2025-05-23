import { ConfigService } from '@nestjs/config';
export declare class VendorConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    getDocumentUploadDir(): string;
    getAllowedDocumentTypes(): string[];
    getMaxFileSize(): number;
}
