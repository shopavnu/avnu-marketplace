"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ImageProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sharp_1 = __importDefault(require("sharp"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
let ImageProcessingService = ImageProcessingService_1 = class ImageProcessingService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ImageProcessingService_1.name);
        this.defaultOptions = {
            width: 800,
            height: 800,
            fit: 'contain',
            format: 'webp',
            quality: 80,
            background: '#ffffff',
            generateThumbnail: true,
            thumbnailWidth: 200,
            thumbnailHeight: 200,
            generateResponsiveSizes: true,
        };
        this.uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads/products';
        this.publicBaseUrl = this.configService.get('PUBLIC_BASE_URL') || 'http://localhost:3000';
        this.ensureUploadDirExists();
    }
    ensureUploadDirExists() {
        const uploadPath = path.resolve(this.uploadDir);
        if (!fs.existsSync(uploadPath)) {
            try {
                fs.mkdirSync(uploadPath, { recursive: true });
                this.logger.log(`Created upload directory: ${uploadPath}`);
            }
            catch (error) {
                this.logger.error(`Failed to create upload directory: ${error.message}`);
            }
        }
    }
    async processImage(imageUrl, options) {
        try {
            const processingOptions = {
                ...this.defaultOptions,
                ...options,
            };
            const response = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            const uniqueId = (0, uuid_1.v4)();
            const extension = processingOptions.format || 'webp';
            const filename = `${uniqueId}.${extension}`;
            const thumbnailFilename = `${uniqueId}-thumbnail.${extension}`;
            const uploadPath = path.resolve(this.uploadDir);
            const filePath = path.join(uploadPath, filename);
            const thumbnailPath = path.join(uploadPath, thumbnailFilename);
            const sharpInstance = (0, sharp_1.default)(buffer);
            if (processingOptions.width || processingOptions.height) {
                sharpInstance.resize({
                    width: processingOptions.width,
                    height: processingOptions.height,
                    fit: processingOptions.fit,
                    background: processingOptions.background,
                    withoutEnlargement: true,
                });
            }
            if (processingOptions.format === 'jpeg') {
                sharpInstance.jpeg({ quality: processingOptions.quality });
            }
            else if (processingOptions.format === 'png') {
                sharpInstance.png({ quality: processingOptions.quality });
            }
            else if (processingOptions.format === 'webp') {
                sharpInstance.webp({ quality: processingOptions.quality });
            }
            else if (processingOptions.format === 'avif') {
                sharpInstance.avif({ quality: processingOptions.quality });
            }
            const processedBuffer = await sharpInstance.toBuffer();
            fs.writeFileSync(filePath, processedBuffer);
            let thumbnailUrl;
            if (processingOptions.generateThumbnail) {
                const thumbnailBuffer = await (0, sharp_1.default)(buffer)
                    .resize({
                    width: processingOptions.thumbnailWidth,
                    height: processingOptions.thumbnailHeight,
                    fit: 'cover',
                })
                    .toFormat(processingOptions.format)
                    .toBuffer();
                fs.writeFileSync(thumbnailPath, thumbnailBuffer);
                thumbnailUrl = `${this.publicBaseUrl}/${this.uploadDir}/${thumbnailFilename}`;
            }
            let mobileUrl;
            let tabletUrl;
            if (processingOptions.generateResponsiveSizes) {
                const mobileFilename = `${uniqueId}-mobile.${extension}`;
                const mobilePath = path.join(uploadPath, mobileFilename);
                const mobileBuffer = await (0, sharp_1.default)(buffer)
                    .resize({
                    width: 400,
                    height: 400,
                    fit: processingOptions.fit,
                    background: processingOptions.background,
                    withoutEnlargement: true,
                })
                    .toFormat(processingOptions.format, {
                    quality: processingOptions.quality,
                })
                    .toBuffer();
                fs.writeFileSync(mobilePath, mobileBuffer);
                mobileUrl = `${this.publicBaseUrl}/${this.uploadDir}/${mobileFilename}`;
                const tabletFilename = `${uniqueId}-tablet.${extension}`;
                const tabletPath = path.join(uploadPath, tabletFilename);
                const tabletBuffer = await (0, sharp_1.default)(buffer)
                    .resize({
                    width: 600,
                    height: 600,
                    fit: processingOptions.fit,
                    background: processingOptions.background,
                    withoutEnlargement: true,
                })
                    .toFormat(processingOptions.format, {
                    quality: processingOptions.quality,
                })
                    .toBuffer();
                fs.writeFileSync(tabletPath, tabletBuffer);
                tabletUrl = `${this.publicBaseUrl}/${this.uploadDir}/${tabletFilename}`;
            }
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
        }
        catch (error) {
            return this.handleProcessingError(imageUrl, error);
        }
    }
    handleProcessingError(imageUrl, error) {
        this.logger.warn(`Using original image URL due to processing error: ${error.message}`);
        return {
            originalUrl: imageUrl,
            processedUrl: imageUrl,
            width: 800,
            height: 800,
            format: 'unknown',
            size: 0,
        };
    }
    async processImages(imageUrls, options) {
        const processingPromises = imageUrls.map(url => this.processImage(url, options));
        return Promise.all(processingPromises);
    }
};
exports.ImageProcessingService = ImageProcessingService;
exports.ImageProcessingService = ImageProcessingService = ImageProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ImageProcessingService);
//# sourceMappingURL=image-processing.service.js.map