import { VendorConfigService } from '../../../modules/config/vendor-config.service';
import { VendorRegistrationService } from '../vendor-registration.service';
declare class VendorRegistrationDto {
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
}
export declare class VendorRegistrationController {
    private readonly _vendorRegistrationService;
    private readonly _configService;
    constructor(_vendorRegistrationService: VendorRegistrationService, _configService: VendorConfigService);
    registerVendor(registrationData: VendorRegistrationDto, files: {
        businessLicense?: Express.Multer.File[];
        identityDocument?: Express.Multer.File[];
    }): Promise<{
        success: boolean;
        message: string;
        applicationId: string;
    }>;
}
export {};
