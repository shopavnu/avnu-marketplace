import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';

import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DocumentType, DocumentStatus, VendorDocument } from '../entities/vendor-document.entity';
import { DocumentUploadService } from '../document-upload-updated.service';
import { DocumentVerificationService, VerificationResult } from '../document-verification.service';

/**
 * Controller for vendor document operations
 * Updated to use the refactored service architecture
 */
@ApiTags('Vendor Documents')
@Controller('vendor-documents')
export class VendorDocumentsController {
  constructor(
    // Inject only the services needed by this controller
    private readonly _documentUploadService: DocumentUploadService,
    private readonly _documentVerificationService: DocumentVerificationService,
  ) {}

  /**
   * Upload a document
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload vendor document' })
  @ApiBearerAuth()
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      documentType: DocumentType;
      applicationId: string;
      documentName: string;
    },
    @Request() _req: { user: { id: string; email: string; roles: string[] } },
  ): Promise<VendorDocument> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      return await this._documentUploadService.uploadDocument(
        file,
        body.documentType,
        body.applicationId,
        body.documentName,
      );
    } catch (error) {
      throw new BadRequestException(
        `Document upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get document by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get document metadata' })
  @ApiBearerAuth()
  async getDocument(@Param('id') id: string): Promise<VendorDocument> {
    try {
      const document = await this._documentUploadService.getDocument(id);
      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      return document;
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Download document file
   */
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Download document file' })
  @ApiBearerAuth()
  async downloadDocumentFile(@Param('id') id: string, @Res() res: Response): Promise<void> {
    try {
      const { buffer, filename, mimetype } = await this._documentUploadService.getDocumentFile(id);

      if (!buffer) {
        throw new NotFoundException(`Document with ID ${id} not found or has no file`);
      }

      res.set({
        'Content-Type': mimetype,
        'Content-Disposition': `attachment; filename="${filename}"`,
      });

      res.send(buffer);
    } catch (error) {
      throw new BadRequestException(
        `Document download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Verify a document (admin only)
   */
  @Patch(':id/verify')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Verify document (admin only)' })
  @ApiBearerAuth()
  async verifyDocument(
    @Param('id') id: string,
    @Body()
    body: {
      status: DocumentStatus;
      notes?: string;
      rejectionReason?: string;
    },
    @Request() _req: { user: { id: string; email: string; roles: string[] } },
  ): Promise<VendorDocument> {
    const adminId = _req.user.id;

    try {
      return await this._documentVerificationService.verifyDocument(id, body.status, {
        adminId,
        notes: body.notes,
        rejectionReason: body.rejectionReason,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Document verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Run automated document verification
   */
  @Post(':id/auto-verify')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Run automated document verification (admin only)' })
  @ApiBearerAuth()
  async runAutoVerification(@Param('id') id: string): Promise<VerificationResult> {
    try {
      return await this._documentVerificationService.runAutoVerification(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Automated verification failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Delete a document (admin only)
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete document (admin only)' })
  @ApiBearerAuth()
  async deleteDocument(@Param('id') id: string): Promise<void> {
    try {
      await this._documentUploadService.deleteDocumentFile(id);
    } catch (error) {
      throw new BadRequestException(
        `Document deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get all documents for an application
   */
  @Get('application/:applicationId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all documents for an application' })
  @ApiBearerAuth()
  async getDocumentsByApplication(
    @Param('applicationId') applicationId: string,
  ): Promise<VendorDocument[]> {
    try {
      return await this._documentVerificationService.getDocumentsByApplication(applicationId);
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
