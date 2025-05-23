"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRegistrationController = void 0;
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const uuid_1 = require("uuid");
const vendor_config_service_1 = require("../../../modules/config/vendor-config.service");
const vendor_registration_service_1 = require("../vendor-registration.service");
class VendorRegistrationDto {
}
let VendorRegistrationController = class VendorRegistrationController {
    constructor(_vendorRegistrationService, _configService) {
        this._vendorRegistrationService = _vendorRegistrationService;
        this._configService = _configService;
    }
    async registerVendor(registrationData, files) {
        try {
            const businessLicensePath = files.businessLicense?.[0]?.path;
            const identityDocumentPath = files.identityDocument?.[0]?.path;
            const application = await this._vendorRegistrationService.createVendorApplication({
                ...registrationData,
                businessLicensePath,
                identityDocumentPath,
            });
            return {
                success: true,
                message: 'Vendor application submitted successfully',
                applicationId: application.id,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(`Registration failed: ${error.message}`);
            }
            else {
                throw new common_1.BadRequestException('Registration failed due to an unknown error');
            }
        }
    }
};
exports.VendorRegistrationController = VendorRegistrationController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register new vendor' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'businessLicense', maxCount: 1 },
        { name: 'identityDocument', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadDir = './uploads/vendor-documents';
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueFileName = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
                cb(null, uniqueFileName);
            },
        }),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Only image and PDF files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VendorRegistrationDto, Object]),
    __metadata("design:returntype", Promise)
], VendorRegistrationController.prototype, "registerVendor", null);
exports.VendorRegistrationController = VendorRegistrationController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Registration'),
    (0, common_1.Controller)('vendors'),
    __metadata("design:paramtypes", [vendor_registration_service_1.VendorRegistrationService,
        vendor_config_service_1.VendorConfigService])
], VendorRegistrationController);
//# sourceMappingURL=vendor-registration.controller.js.map