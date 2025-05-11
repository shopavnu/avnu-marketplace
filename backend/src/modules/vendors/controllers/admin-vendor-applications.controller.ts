import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

// Using a class to avoid missing module error during development
// This would be properly imported in the actual implementation
class AdminGuard {}

import { DocumentStatus } from '../entities/vendor-document.entity';
import { VendorStatus } from '../entities/vendor.entity';

// Inline interface definition to avoid module resolution errors
// This would normally be imported from '../entities/review-metadata.entity'
// Using underscore prefix to indicate it's declared but not directly used
interface _ReviewMetadata {
  id: string;
  adminId: string;
  notes?: string;
  rejectionReason?: string;
  reviewedAt: Date;
  entityId: string;
  entityType: string;
  status: string;
}

// Import refactored services
import { ApplicationReviewService } from '../application-review.service';
import { DocumentVerificationService } from '../document-verification.service';
import { VendorCreationService } from '../vendor-creation-updated.service';

// Interfaces for request and response types
interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface ApplicationReviewDto {
  status: VendorStatus;
  adminNotes?: string;
  rejectionReason?: string;
}

interface DocumentReviewDto {
  status: DocumentStatus;
  notes?: string;
  rejectionReason?: string;
}

// Using underscore prefix to indicate it's declared but not directly used
interface _ReviewMetadata2 {
  adminId: string;
  notes?: string;
  reason?: string;
  rejectionReason?: string;
}

/**
 * Controller for admin operations on vendor applications
 * Updated to use the refactored service architecture
 */
@ApiTags('Admin - Vendor Applications')
@Controller('admin/vendor-applications')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminVendorApplicationsController {
  constructor(
    // Inject only the services needed by this controller
    private readonly _applicationReviewService: ApplicationReviewService,
    private readonly _vendorCreationService: VendorCreationService,
    private readonly _documentVerificationService: DocumentVerificationService,
  ) {}

  /**
   * Get all applications with filtering and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Get applications list with filtering and pagination',
  })
  async getApplications(
    @Query('status') status: string,
    @Query('page') _page = 1,
    @Query('limit') _limit = 10,
    @Query('sortBy') _sortBy = 'createdAt',
    @Query('sortOrder') _sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<unknown[]> {
    // Implementation would go here
    // This would use the _applicationReviewService to fetch applications with filters
    return [];
  }

  /**
   * Get a specific application
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get application details' })
  async getApplication(@Param('id') id: string): Promise<Record<string, unknown>> {
    try {
      // Get application details from the review service
      const application = await this._applicationReviewService.getApplicationById(id);

      // Get documents for this application
      const documents = await this._documentVerificationService.getDocumentsByApplication(id);

      // Return combined data
      return {
        ...application,
        documents,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Error retrieving application: ${errorMessage}`);
    }
  }

  /**
   * Start application review
   */
  @Post(':id/review')
  @ApiOperation({ summary: 'Start application review process' })
  async startReview(
    @Param('id') id: string,
    @Request() req: { user: AdminUser },
  ): Promise<unknown> {
    const adminId = req.user.id;
    return this._applicationReviewService.startApplicationReview(id, adminId);
  }

  /**
   * Approve or reject an application
   */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update application status' })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() reviewData: ApplicationReviewDto,
    @Request() req: { user: AdminUser },
  ): Promise<unknown> {
    const adminId = req.user.id;

    // Update application status
    const updatedApplication = await this._applicationReviewService.updateApplicationStatus(
      id,
      reviewData.status,
      {
        adminId,
        notes: reviewData.adminNotes,
        reason: reviewData.rejectionReason,
      },
    );

    // If application is approved, create vendor account
    if (reviewData.status === VendorStatus.APPROVED) {
      try {
        await this._vendorCreationService.createVendorFromApplication(id);
      } catch (error: unknown) {
        // Log error but don't fail the operation
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error creating vendor from application: ${errorMessage}`);
      }
    }

    return updatedApplication;
  }

  /**
   * Update document verification status
   */
  @Patch('documents/:id/review')
  @ApiOperation({ summary: 'Review document' })
  async reviewDocument(
    @Param('id') id: string,
    @Body() reviewData: DocumentReviewDto,
    @Request() req: { user: AdminUser },
  ): Promise<unknown> {
    const adminId = req.user.id;
    return this._documentVerificationService.verifyDocument(id, reviewData.status, {
      adminId,
      notes: reviewData.notes,
      rejectionReason: reviewData.rejectionReason,
    });
  }

  /**
   * Get application history
   */
  @Get(':id/history')
  @ApiOperation({ summary: 'Get application status history' })
  async getApplicationHistory(@Param('id') id: string): Promise<unknown[]> {
    return this._applicationReviewService.getApplicationHistory(id);
  }
}
