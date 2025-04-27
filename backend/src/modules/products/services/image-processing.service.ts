import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
  withoutEnlargement?: boolean;
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  generateResponsiveSizes?: boolean; // Generate mobile and tablet sizes
}

/**
 * Processed image result
 */
export interface ProcessedImage {
  originalUrl: string;
  processedUrl: string;
  thumbnailUrl?: string;
  mobileUrl?: string; // URL for mobile-sized image (400x400)
  tabletUrl?: string; // URL for tablet-sized image (600x600)
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Service for processing product images
 */
@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;

  // Default processing options
  private readonly defaultOptions: ImageProcessingOptions = {
    width: 800,
    height: 800,
    fit: 'contain',
    format: 'webp',
    quality: 80,
    background: '#ffffff',
    generateThumbnail: true,
    thumbnailWidth: 200,
    thumbnailHeight: 200,
    generateResponsiveSizes: true, // Enable responsive sizes by default
  };

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads/products';
    this.publicBaseUrl = this.configService.get('PUBLIC_BASE_URL') || 'http://localhost:3000';

    // Create upload directory if it doesn't exist
    this.ensureUploadDirExists();
  }

  /**
   * Ensure the upload directory exists
   */
  private ensureUploadDirExists(): void {
    const uploadPath = path.resolve(this.uploadDir);

    if (!fs.existsSync(uploadPath)) {
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
        this.logger.log(`Created upload directory: ${uploadPath}`);
      } catch (error) {
        this.logger.error(`Failed to create upload directory: ${error.message}`);
      }
    }
  }

  /**
   * Process a single image URL
   * @param imageUrl URL of the image to process
   * @param options Processing options
   * @returns Processed image result
   */
  async processImage(
    imageUrl: string,
    options?: Partial<ImageProcessingOptions>,
  ): Promise<ProcessedImage> {
    try {
      // Merge with default options
      const processingOptions: ImageProcessingOptions = {
        ...this.defaultOptions,
        ...options,
      };

      // Download the image
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data as ArrayBuffer);

      // Generate unique filename
      const uniqueId = uuidv4();
      const extension = processingOptions.format || 'webp';
      const filename = `${uniqueId}.${extension}`;
      const thumbnailFilename = `${uniqueId}-thumbnail.${extension}`;

      // Create paths
      const uploadPath = path.resolve(this.uploadDir);
      const filePath = path.join(uploadPath, filename);
      const thumbnailPath = path.join(uploadPath, thumbnailFilename);

      // Process the main image
      const sharpInstance = sharp(buffer as Buffer);

      // Resize if dimensions provided
      if (processingOptions.width || processingOptions.height) {
        sharpInstance.resize({
          width: processingOptions.width,
          height: processingOptions.height,
          fit: processingOptions.fit,
          background: processingOptions.background,
          withoutEnlargement: true,
        });
      }

      // Set format and quality
      if (processingOptions.format === 'jpeg') {
        sharpInstance.jpeg({ quality: processingOptions.quality });
      } else if (processingOptions.format === 'png') {
        sharpInstance.png({ quality: processingOptions.quality });
      } else if (processingOptions.format === 'webp') {
        sharpInstance.webp({ quality: processingOptions.quality });
      } else if (processingOptions.format === 'avif') {
        sharpInstance.avif({ quality: processingOptions.quality });
      }

      // Generate and save the main image
      const processedBuffer = await sharpInstance.toBuffer();
      fs.writeFileSync(filePath, processedBuffer);

      // Generate thumbnail if requested
      let thumbnailUrl: string | undefined;
      if (processingOptions.generateThumbnail) {
        const thumbnailBuffer = await sharp(buffer as Buffer)
          .resize({
            width: processingOptions.thumbnailWidth,
            height: processingOptions.thumbnailHeight,
            fit: 'cover',
          })
          .toFormat(processingOptions.format as keyof sharp.FormatEnum)
          .toBuffer();

        fs.writeFileSync(thumbnailPath, thumbnailBuffer);
        thumbnailUrl = `${this.publicBaseUrl}/${this.uploadDir}/${thumbnailFilename}`;
      }

      // Generate responsive sizes if requested
      let mobileUrl: string | undefined;
      let tabletUrl: string | undefined;

      if (processingOptions.generateResponsiveSizes) {
        // Mobile size (400x400)
        const mobileFilename = `${uniqueId}-mobile.${extension}`;
        const mobilePath = path.join(uploadPath, mobileFilename);
        const mobileBuffer = await sharp(buffer as Buffer)
          .resize({
            width: 400,
            height: 400,
            fit: processingOptions.fit,
            background: processingOptions.background,
            withoutEnlargement: true,
          })
          .toFormat(processingOptions.format as keyof sharp.FormatEnum, {
            quality: processingOptions.quality,
          })
          .toBuffer();

        fs.writeFileSync(mobilePath, mobileBuffer);
        mobileUrl = `${this.publicBaseUrl}/${this.uploadDir}/${mobileFilename}`;

        // Tablet size (600x600)
        const tabletFilename = `${uniqueId}-tablet.${extension}`;
        const tabletPath = path.join(uploadPath, tabletFilename);
        const tabletBuffer = await sharp(buffer as Buffer)
          .resize({
            width: 600,
            height: 600,
            fit: processingOptions.fit,
            background: processingOptions.background,
            withoutEnlargement: true,
          })
          .toFormat(processingOptions.format as keyof sharp.FormatEnum, {
            quality: processingOptions.quality,
          })
          .toBuffer();

        fs.writeFileSync(tabletPath, tabletBuffer);
        tabletUrl = `${this.publicBaseUrl}/${this.uploadDir}/${tabletFilename}`;
      }

      // Return the processed image information
      const processedUrl = `${this.publicBaseUrl}/${this.uploadDir}/${filename}`;

      return {
        originalUrl: imageUrl,
        processedUrl,
        thumbnailUrl,
        mobileUrl,
        tabletUrl,
        width: processingOptions.width || 800,
        height: processingOptions.height || 800,
        format: processingOptions.format || 'webp',
        size: processedBuffer.length,
      };
    } catch (error) {
      // Fallback to original URL if processing fails
      return this.handleProcessingError(imageUrl, error);
    }
  }

  private handleProcessingError(imageUrl: string, error: Error): ProcessedImage {
    this.logger.warn(`Using original image URL due to processing error: ${error.message}`);
    return {
      originalUrl: imageUrl,
      processedUrl: imageUrl,
      width: 800, // Default width
      height: 800, // Default height
      format: 'unknown',
      size: 0,
    };
  }

  /**
   * Process multiple image URLs
   * @param imageUrls Array of image URLs to process
   * @param options Processing options
   * @returns Array of processed image URLs
   */
  async processImages(
    imageUrls: string[],
    options?: Partial<ImageProcessingOptions>,
  ): Promise<ProcessedImage[]> {
    const processingPromises = imageUrls.map(url => this.processImage(url, options));
    return Promise.all(processingPromises);
  }
}
