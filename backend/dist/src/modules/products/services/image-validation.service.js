'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var ImageValidationService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ImageValidationService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const probeImageSize = __importStar(require('probe-image-size'));
const is_url_1 = __importDefault(require('is-url'));
const axios_1 = __importDefault(require('axios'));
let ImageValidationService = (ImageValidationService_1 = class ImageValidationService {
  constructor(configService) {
    this.configService = configService;
    this.logger = new common_1.Logger(ImageValidationService_1.name);
    this.defaultOptions = {
      minWidth: 400,
      minHeight: 400,
      maxWidth: 4000,
      maxHeight: 4000,
      allowedFormats: ['jpeg', 'jpg', 'png', 'webp', 'gif'],
      maxFileSize: 5 * 1024 * 1024,
      aspectRatioTolerance: 0.1,
    };
  }
  async validateImage(imageUrl, options = {}) {
    try {
      const validationOptions = {
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
          const response = await axios_1.default.head(imageUrl);
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
  async validateImages(imageUrls, options = {}) {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('No images provided for validation');
    }
    const validationPromises = imageUrls.map(url => this.validateImage(url, options));
    return Promise.all(validationPromises);
  }
  async areAllImagesValid(imageUrls) {
    const validationResults = await this.validateImages(imageUrls);
    return validationResults.every(result => result.isValid);
  }
  async getValidImages(imageUrls) {
    const validationResults = await this.validateImages(imageUrls);
    const validImages = [];
    validationResults.forEach((result, index) => {
      if (result.isValid) {
        validImages.push(imageUrls[index]);
      }
    });
    return validImages;
  }
  isValidUrl(url) {
    try {
      return typeof url === 'string' && (0, is_url_1.default)(url);
    } catch (error) {
      this.logger.error(`Error validating URL: ${error.message}`);
      return false;
    }
  }
});
exports.ImageValidationService = ImageValidationService;
exports.ImageValidationService =
  ImageValidationService =
  ImageValidationService_1 =
    __decorate(
      [(0, common_1.Injectable)(), __metadata('design:paramtypes', [config_1.ConfigService])],
      ImageValidationService,
    );
//# sourceMappingURL=image-validation.service.js.map
