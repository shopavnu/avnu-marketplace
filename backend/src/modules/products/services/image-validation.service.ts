import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as probeImageSize from 'probe-image-size';
import isUrl from 'is-url';
import axios from 'axios';

export interface ImageValidationOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
  requiredAspectRatio?: number;
  aspectRatioTolerance?: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  type: string;
  size?: number;
  aspectRatio: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  width?: number;
  height?: number;
  format?: string;
  aspectRatio?: number;
  size?: number;
  error?: string;
}

@Injectable()
export class ImageValidationService {
  private readonly defaultOptions: ImageValidationOptions;

  private readonly logger = new Logger(ImageValidationService.name);

  constructor(private readonly configService: ConfigService) {
    this.defaultOptions = {
      minWidth: 400,
      minHeight: 400,
      maxWidth: 4000,
      maxHeight: 4000,
      allowedFormats: ['jpeg', 'jpg', 'png', 'webp', 'gif'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      aspectRatioTolerance: 0.1, // 10% tolerance
    };
  }

  async validateImage(
    imageUrl: string,
    options: ImageValidationOptions = {},
  ): Promise<ImageValidationResult> {
    try {
      const validationOptions: ImageValidationOptions = {
        ...this.defaultOptions,
        ...options,
      };

      if (!this.isValidUrl(imageUrl)) {
        return {
          isValid: false,
          error: 'Invalid URL format',
        };
      }

      const result = await probeImageSize(imageUrl);
      const aspectRatio = result.width / result.height;

      if (validationOptions.minWidth && result.width < validationOptions.minWidth) {
        return {
          isValid: false,
          width: result.width,
          height: result.height,
          format: result.type,
          aspectRatio,
          error: `Image width too small. Minimum required: ${validationOptions.minWidth}px`,
        };
      }

      if (validationOptions.minHeight && result.height < validationOptions.minHeight) {
        return {
          isValid: false,
          width: result.width,
          height: result.height,
          format: result.type,
          aspectRatio,
          error: `Image height too small. Minimum required: ${validationOptions.minHeight}px`,
        };
      }

      if (validationOptions.maxWidth && result.width > validationOptions.maxWidth) {
        return {
          isValid: false,
          width: result.width,
          height: result.height,
          format: result.type,
          aspectRatio,
          error: `Image width too large. Maximum allowed: ${validationOptions.maxWidth}px`,
        };
      }

      if (validationOptions.maxHeight && result.height > validationOptions.maxHeight) {
        return {
          isValid: false,
          width: result.width,
          height: result.height,
          format: result.type,
          aspectRatio,
          error: `Image height too large. Maximum allowed: ${validationOptions.maxHeight}px`,
        };
      }

      if (
        validationOptions.allowedFormats &&
        !validationOptions.allowedFormats.includes(result.type)
      ) {
        return {
          isValid: false,
          width: result.width,
          height: result.height,
          format: result.type,
          aspectRatio,
          error: `Unsupported image format: ${result.type}. Supported formats: ${validationOptions.allowedFormats.join(', ')}`,
        };
      }

      if (validationOptions.requiredAspectRatio) {
        const tolerance = validationOptions.aspectRatioTolerance || 0.1;
        const minRatio = validationOptions.requiredAspectRatio * (1 - tolerance);
        const maxRatio = validationOptions.requiredAspectRatio * (1 + tolerance);

        if (aspectRatio < minRatio || aspectRatio > maxRatio) {
          return {
            isValid: false,
            width: result.width,
            height: result.height,
            format: result.type,
            aspectRatio,
            error: `Image aspect ratio (${aspectRatio.toFixed(2)}) does not match required ratio (${validationOptions.requiredAspectRatio})`,
          };
        }
      }

      if (validationOptions.maxFileSize) {
        try {
          const response = await axios.head(imageUrl);
          const fileSize = parseInt(response.headers['content-length'] || '0', 10);

          if (fileSize > validationOptions.maxFileSize) {
            return {
              isValid: false,
              width: result.width,
              height: result.height,
              format: result.type,
              aspectRatio,
              size: fileSize,
              error: `Image file size (${Math.round(fileSize / 1024)}KB) exceeds maximum allowed (${Math.round(validationOptions.maxFileSize / 1024)}KB)`,
            };
          }
        } catch (sizeError) {
          this.logger.warn(`Could not determine file size for ${imageUrl}: ${sizeError.message}`);
          // Continue validation even if we can't determine file size
        }
      }

      return {
        isValid: true,
        width: result.width,
        height: result.height,
        format: result.type,
        aspectRatio,
        size: result.length,
      };
    } catch (error) {
      this.logger.error(`Failed to validate image ${imageUrl}: ${error.message}`);
      return {
        isValid: false,
        error: `Failed to validate image: ${error.message}`,
      };
    }
  }

  async validateImages(
    imageUrls: string[],
    options: ImageValidationOptions = {},
  ): Promise<ImageValidationResult[]> {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('No images provided for validation');
    }

    // Validate each image in parallel
    const validationPromises = imageUrls.map(url => this.validateImage(url, options));
    return Promise.all(validationPromises);
  }

  /**
   * Check if all images in an array are valid
   * @param imageUrls Array of image URLs to validate
   * @returns True if all images are valid
   */
  async areAllImagesValid(imageUrls: string[]): Promise<boolean> {
    const validationResults = await this.validateImages(imageUrls);
    return validationResults.every(result => result.isValid);
  }

  /**
   * Get only valid images from an array of URLs
   * @param imageUrls Array of image URLs to validate
   * @returns Array of valid image URLs
   */
  async getValidImages(imageUrls: string[]): Promise<string[]> {
    const validationResults = await this.validateImages(imageUrls);
    const validImages: string[] = [];

    validationResults.forEach((result, index) => {
      if (result.isValid) {
        validImages.push(imageUrls[index]);
      }
    });

    return validImages;
  }

  private isValidUrl(url: string): boolean {
    try {
      return typeof url === 'string' && isUrl(url);
    } catch (error) {
      this.logger.error(`Error validating URL: ${error.message}`);
      return false;
    }
  }
}
