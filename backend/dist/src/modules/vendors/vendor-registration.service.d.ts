import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { VendorApplication } from './entities/vendor-application.entity';
import { VendorDocument } from './entities/vendor-document.entity';
import { Vendor } from './entities/vendor.entity';
import { TransactionService } from '../../common/transaction.service';
import { VendorEventBus } from '../../events/vendor-event-bus.service';
export interface IVendorApplicationDto {
    businessName: string;
    businessEmail: string;
    phone: string;
    businessType: string;
    productCategories: string[];
    productDescription: string;
    estimatedProductCount: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    businessId: string;
    termsAgreement: boolean;
    businessLicensePath?: string;
    identityDocumentPath?: string;
}
export interface ISanitizedVendorFormData {
    businessName: string;
    businessEmail: string;
    phone: string;
    businessType: string;
    productCategories: string[];
    productDescription: string;
    estimatedProductCount: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    businessId: string;
    [key: string]: unknown;
}
export declare class VendorRegistrationService {
    private readonly _vendorRepository;
    private readonly _vendorApplicationRepository;
    private readonly _vendorDocumentRepository;
    private readonly _transactionService;
    private readonly _eventBus;
    private readonly _configService;
    private readonly _logger;
    constructor(_vendorRepository: Repository<Vendor>, _vendorApplicationRepository: Repository<VendorApplication>, _vendorDocumentRepository: Repository<VendorDocument>, _transactionService: TransactionService, _eventBus: VendorEventBus, _configService: ConfigService);
    createVendorApplication(applicationData: IVendorApplicationDto): Promise<VendorApplication>;
    getApplicationStatus(applicationId: string): Promise<VendorApplication>;
    private _sanitizeFormData;
}
