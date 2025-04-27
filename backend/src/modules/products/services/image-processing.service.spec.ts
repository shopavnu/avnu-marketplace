import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ImageProcessingService } from './image-processing.service';
import axios from 'axios';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

// Mock dependencies
jest.mock('axios');
jest.mock('sharp');
jest.mock('fs');
jest.mock('path');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-1234'),
}));

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;
  let _configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageProcessingService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation(key => {
              const config = {
                UPLOAD_DIR: 'uploads/products',
                PUBLIC_BASE_URL: 'http://localhost:3000',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ImageProcessingService>(ImageProcessingService);
    _configService = module.get<ConfigService>(ConfigService);

    // Mock path.resolve and path.join
    (path.resolve as jest.Mock).mockImplementation(p => `/resolved/${p}`);
    (path.join as jest.Mock).mockImplementation((...parts) => parts.join('/'));

    // Mock fs.existsSync and fs.mkdirSync
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processImage', () => {
    it('should process an image successfully', async () => {
      // Mock axios response
      const mockBuffer = Buffer.from('test-image-data');
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockBuffer,
      });

      // Mock sharp instance and methods
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        png: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        avif: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image-data')),
        toFormat: jest.fn().mockReturnThis(),
      };
      (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);

      const result = await service.processImage('https://example.com/image.jpg', {
        width: 800,
        height: 800,
        format: 'webp',
        quality: 80,
      });

      // Verify axios was called to download the image
      expect(axios.get).toHaveBeenCalledWith('https://example.com/image.jpg', {
        responseType: 'arraybuffer',
      });

      // Verify sharp was called with the buffer
      expect(sharp).toHaveBeenCalled();

      // Verify resize was called with the correct options
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 800,
        height: 800,
        fit: 'contain',
        background: '#ffffff',
        withoutEnlargement: true,
      });

      // Verify webp format was set
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 80 });

      // Verify toBuffer was called
      expect(mockSharpInstance.toBuffer).toHaveBeenCalled();

      // Verify file was written
      expect(fs.writeFileSync).toHaveBeenCalled();

      // Verify the result is the expected URL
      expect(result).toBe('http://localhost:3000/uploads/products/test-uuid-1234.webp');
    });

    it('should generate a thumbnail if requested', async () => {
      // Mock axios response
      const mockBuffer = Buffer.from('test-image-data');
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockBuffer,
      });

      // Mock sharp instance and methods
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        png: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        avif: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image-data')),
        toFormat: jest.fn().mockReturnThis(),
      };
      (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);

      const result = await service.processImage('https://example.com/image.jpg', {
        width: 800,
        height: 800,
        format: 'webp',
        quality: 80,
        generateThumbnail: true,
        thumbnailWidth: 200,
        thumbnailHeight: 200,
      });

      // Verify sharp was called twice (once for main image, once for thumbnail)
      expect(sharp).toHaveBeenCalledTimes(2);

      // Verify fs.writeFileSync was called twice
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);

      // Verify the result is the expected URL
      expect(result).toBe('http://localhost:3000/uploads/products/test-uuid-1234.webp');
    });

    it('should handle errors gracefully', async () => {
      // Mock axios to throw an error
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.processImage('https://example.com/image.jpg')).rejects.toThrow(
        'Failed to process image',
      );
    });
  });

  describe('processImages', () => {
    it('should process multiple images', async () => {
      // Mock processImage to return predefined results
      const mockProcessedImage1: any = {
        originalUrl: 'https://example.com/image1.jpg',
        processedUrl: 'http://localhost:3000/uploads/products/image1.webp',
        width: 800,
        height: 800,
        format: 'webp',
        size: 1024,
      };

      const mockProcessedImage2: any = {
        originalUrl: 'https://example.com/image2.jpg',
        processedUrl: 'http://localhost:3000/uploads/products/image2.webp',
        width: 800,
        height: 800,
        format: 'webp',
        size: 1024,
      };

      jest
        .spyOn(service, 'processImage')
        .mockResolvedValueOnce(mockProcessedImage1)
        .mockResolvedValueOnce(mockProcessedImage2);

      const results = await service.processImages([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);

      expect(results.length).toBe(2);
      expect(results[0].processedUrl).toBe('http://localhost:3000/uploads/products/image1.webp');
      expect(results[1].processedUrl).toBe('http://localhost:3000/uploads/products/image2.webp');
      expect(service.processImage).toHaveBeenCalledTimes(2);
    });
  });

  // The generateThumbnail method has been removed or integrated into processImage
  // so we'll remove this test

  // The optimizeImage method has been removed or integrated into processImage
  // so we'll remove this test
});
