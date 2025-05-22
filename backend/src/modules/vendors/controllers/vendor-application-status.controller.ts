import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { VendorStatus } from '../entities/vendor.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

// Import refactored services
import { ApplicationReviewService } from '../application-review.service';
import { DocumentVerificationService } from '../document-verification.service';
import { VendorRegistrationService } from '../vendor-registration.service';

// Interface for application status response
interface ApplicationStatusResponse {
  id: string;
  status: VendorStatus;
  submittedAt: Date;
  estimatedReviewTime: string;
}

// Interface for document details
interface DocumentDetails {
  id: string;
  name: string;
  status: string;
  documentType: string;
  submittedAt: Date;
  rejectionReason?: string;
}

// Interface for application details response
interface ApplicationDetailsResponse {
  id: string;
  status: VendorStatus;
  submittedAt: Date;
  reviewCompletedAt?: Date;
  currentStep: string;
  rejectionReason?: string;
  businessName: string;
  businessEmail: string;
  documents: DocumentDetails[];
  history: unknown[];
  nextSteps: string;
}

// Interface for authenticated user
interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}

/**
 * Controller for vendors to check their application status
 * Updated to use the refactored service architecture
 */
@ApiTags('Vendor Application Status')
@Controller('vendors/applications')
export class VendorApplicationStatusController {
  constructor(
    private readonly _vendorRegistrationService: VendorRegistrationService,
    private readonly _applicationReviewService: ApplicationReviewService,
    private readonly _documentVerificationService: DocumentVerificationService,
  ) {}

  /**
   * Get application status without authentication
   * (using application ID as a secret token)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get basic application status by ID' })
  @ApiParam({
    name: 'id',
    description: 'Application ID (acts as a secure token)',
  })
  async getApplicationStatus(@Param('id') id: string): Promise<ApplicationStatusResponse> {
    try {
      const application = await this._vendorRegistrationService.getApplicationStatus(id);

      // Return simplified status information
      return {
        id: application.id,
        status: application.status,
        submittedAt: application.submittedAt,
        estimatedReviewTime: '2-3 business days',
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Error retrieving application status: ${errorMessage}`);
    }
  }

  /**
   * Get detailed application status for authenticated vendors
   */
  @Get('/:id/details')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get detailed application status (authenticated)' })
  @ApiBearerAuth()
  async getApplicationDetails(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<ApplicationDetailsResponse> {
    try {
      // Get application from review service
      const application = await this._applicationReviewService.getApplicationById(id);

      // Ensure user is authorized to view this application
      if (application.formData.businessEmail !== req.user.email) {
        throw new ForbiddenException('You are not authorized to view this application');
      }

      // Get documents
      const documents = await this._documentVerificationService.getDocumentsByApplication(id);

      // Get application history
      const history = await this._applicationReviewService.getApplicationHistory(id);

      // Return more detailed information for authenticated users
      return {
        id: application.id,
        status: application.status,
        submittedAt: application.submittedAt,
        reviewCompletedAt: application.reviewCompletedAt,
        currentStep: application.currentStep,
        rejectionReason: application.rejectionReason,
        businessName: application.formData.businessName,
        businessEmail: application.formData.businessEmail,
        documents: documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          status: doc.status,
          documentType: doc.documentType,
          submittedAt: doc.createdAt,
          rejectionReason: doc.rejectionReason,
        })),
        history,
        nextSteps: this._getNextStepsForStatus(application.status),
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Error retrieving application details: ${errorMessage}`);
    }
  }

  /**
   * Get guidance on next steps based on application status
   */
  private _getNextStepsForStatus(status: VendorStatus): string {
    switch (status) {
      case VendorStatus.PENDING:
        return 'Your application is in the queue for review. We typically process applications within 2-3 business days.';
      case VendorStatus.UNDER_REVIEW:
        return 'Your application is currently being reviewed by our team. We may contact you if we need any additional information.';
      case VendorStatus.APPROVED:
        return 'Congratulations! Your application has been approved. You can now log in to your vendor dashboard to start selling.';
      case VendorStatus.REJECTED:
        return 'Unfortunately, your application has not been approved at this time. Please review the feedback provided and consider reapplying after addressing the concerns.';
      case VendorStatus.SUSPENDED:
        return 'Your vendor account has been suspended. Please contact our support team for assistance with resolving this issue.';
      default:
        return 'Check back later for updates on your application status.';
    }
  }
}
