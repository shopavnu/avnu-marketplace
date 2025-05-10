import { extname } from 'path';

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Import refactored services
import { VendorConfigService } from '../../../modules/config/vendor-config.service';
import { VendorRegistrationService } from '../vendor-registration.service';

// Import DTOs
// In a real implementation, these would be in separate files
class VendorRegistrationDto {
  businessName!: string;
  businessEmail!: string;
  phone!: string;
  businessType!: string;
  productCategories!: string[];
  productDescription!: string;
  estimatedProductCount!: string;
  bankName!: string;
  accountHolderName!: string;
  accountNumber!: string;
  routingNumber!: string;
  businessId!: string;
  termsAgreement!: boolean;
}

/**
 * Controller for vendor registration
 * Updated to use the refactored service architecture
 */
@ApiTags('Vendor Registration')
@Controller('vendors')
export class VendorRegistrationController {
  constructor(
    private readonly _vendorRegistrationService: VendorRegistrationService,
    private readonly _configService: VendorConfigService,
  ) {}

  /**
   * Register a new vendor
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new vendor' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'businessLicense', maxCount: 1 },
        { name: 'identityDocument', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb): void => {
            // Get upload directory from config service
            const uploadDir = './uploads/vendor-documents';
            cb(null, uploadDir);
          },
          filename: (req, file, cb): void => {
            const uniqueFileName = `${uuidv4()}${extname(file.originalname)}`;
            cb(null, uniqueFileName);
          },
        }),
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
        fileFilter: (req, file, cb): void => {
          // Get allowed MIME types from config service
          const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

          if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new BadRequestException('Only image and PDF files are allowed'), false);
          }
          cb(null, true);
        },
      },
    ),
  )
  async registerVendor(
    @Body() registrationData: VendorRegistrationDto,
    @UploadedFiles()
    files: {
      businessLicense?: Express.Multer.File[];
      identityDocument?: Express.Multer.File[];
    },
  ): Promise<{ success: boolean; message: string; applicationId: string }> {
    try {
      // Extract file paths
      const businessLicensePath = files.businessLicense?.[0]?.path;
      const identityDocumentPath = files.identityDocument?.[0]?.path;

      // Create vendor application using the registration service
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
    } catch (error) {
      // Properly handle different error types
      if (error instanceof Error) {
        throw new BadRequestException(`Registration failed: ${error.message}`);
      } else {
        throw new BadRequestException('Registration failed due to an unknown error');
      }
    }
  }
}
