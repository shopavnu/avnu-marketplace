import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ImageValidationService } from './image-validation.service';
import * as probeImageSizeImport from 'probe-image-size'; // Import the mock
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('probe-image-size'); // Now uses manual mock from __mocks__ directory
jest.mock('is-url', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(url => {
    return url.startsWith('http');
  }),
}));

describe('ImageValidationService', () => {
  let service: ImageValidationService;
  let _configService: ConfigService;
  // mockedProbeImageSizeFn is declared outside, accessible here

  beforeEach(async () => {
    (probeImageSizeImport as jest.Mock).mockClear(); // Clear previous test's specific mock settings
    (probeImageSizeImport as jest.Mock).mockResolvedValue({
      width: 800,
      height: 800,
      type: 'jpeg',
      length: 102400,
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageValidationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation(key => {
              const config = {
                MIN_IMAGE_WIDTH: 400,
                MIN_IMAGE_HEIGHT: 400,
                MAX_IMAGE_WIDTH: 4000,
                MAX_IMAGE_HEIGHT: 4000,
                MAX_IMAGE_SIZE_KB: 5000,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ImageValidationService>(ImageValidationService);
    _configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateImage', () => {
    it('should return invalid result for non-URL strings', async () => {
      const result = await service.validateImage('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid URL format');
    });

    it('should validate a valid image URL', async () => {
      // Mock probe-image-size response
      const mockProbeResult = {
        width: 800,
        height: 800,
        type: 'jpeg',
        length: 102400, // 100KB
      };
      (probeImageSizeImport as jest.Mock).mockResolvedValue(mockProbeResult);

      // Mock axios head response for file size
      (axios.head as jest.Mock).mockResolvedValue({
        headers: {
          'content-length': '102400',
        },
      });

      const result = await service.validateImage('https://example.com/image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.width).toBe(800);
      expect(result.height).toBe(800);
      expect(result.format).toBe('jpeg');
      expect(result.aspectRatio).toBe(1);
    });

    it('should reject images that are too small', async () => {
      // Mock probe-image-size response for small image
      const mockProbeResult = {
        width: 300,
        height: 300,
        type: 'jpeg',
        length: 51200, // 50KB
      };
      (probeImageSizeImport as jest.Mock).mockResolvedValue(mockProbeResult);

      const result = await service.validateImage('https://example.com/small-image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too small');
    });

    it('should reject images that are too large', async () => {
      // Mock probe-image-size response for large dimensions
      const mockProbeResult = {
        width: 5000,
        height: 5000,
        type: 'jpeg',
        length: 1024000, // 1MB
      };
      (probeImageSizeImport as jest.Mock).mockResolvedValue(mockProbeResult);

      const result = await service.validateImage('https://example.com/large-image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should reject unsupported image formats', async () => {
      // Mock probe-image-size response for unsupported format
      const mockProbeResult = {
        width: 800,
        height: 800,
        type: 'bmp',
        length: 102400, // 100KB
      };
      (probeImageSizeImport as jest.Mock).mockResolvedValue(mockProbeResult);

      const result = await service.validateImage('https://example.com/image.bmp');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported image format');
    });

    it('should reject images with incorrect aspect ratio when required', async () => {
      // Mock probe-image-size response
      const mockProbeResult = {
        width: 800,
        height: 600,
        type: 'jpeg',
        length: 102400, // 100KB
      };
      (probeImageSizeImport as jest.Mock).mockResolvedValue(mockProbeResult);

      const result = await service.validateImage('https://example.com/image.jpg', {
        requiredAspectRatio: 1, // Square aspect ratio required
        aspectRatioTolerance: 0.05, // 5% tolerance
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('aspect ratio');
    });

    it('should handle probe errors gracefully', async () => {
      // Mock probe-image-size to throw an error
      (probeImageSizeImport as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.validateImage('https://example.com/broken-image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Failed to validate image');
    });
  });

  describe('validateImages', () => {
    it('should validate multiple images', async () => {
      // Mock validateImage to return predefined results
      jest
        .spyOn(service, 'validateImage')
        .mockResolvedValueOnce({
          isValid: true,
          width: 800,
          height: 800,
          format: 'jpeg',
          aspectRatio: 1,
        })
        .mockResolvedValueOnce({ isValid: false, error: 'Invalid image' });

      const results = await service.validateImages([
        'https://example.com/valid-image.jpg',
        'https://example.com/invalid-image.jpg',
      ]);

      expect(results.length).toBe(2);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
    });
  });

  describe('areAllImagesValid', () => {
    it('should return true when all images are valid', async () => {
      // Mock validateImages to return all valid results
      jest.spyOn(service, 'validateImages').mockResolvedValue([
        { isValid: true, width: 800, height: 800, format: 'jpeg', aspectRatio: 1 },
        { isValid: true, width: 800, height: 800, format: 'png', aspectRatio: 1 },
      ]);

      const result = await service.areAllImagesValid([
        'https://example.com/image1.jpg',
        'https://example.com/image2.png',
      ]);

      expect(result).toBe(true);
    });

    it('should return false when any image is invalid', async () => {
      // Mock validateImages to return one invalid result
      jest.spyOn(service, 'validateImages').mockResolvedValue([
        { isValid: true, width: 800, height: 800, format: 'jpeg', aspectRatio: 1 },
        { isValid: false, error: 'Invalid image' },
      ]);

      const result = await service.areAllImagesValid([
        'https://example.com/image1.jpg',
        'https://example.com/invalid-image.jpg',
      ]);

      expect(result).toBe(false);
    });
  });

  describe('getValidImages', () => {
    it('should return only valid image URLs', async () => {
      // Mock validateImages to return mixed results
      jest.spyOn(service, 'validateImages').mockResolvedValue([
        { isValid: true, width: 800, height: 800, format: 'jpeg', aspectRatio: 1 },
        { isValid: false, error: 'Invalid image' },
        { isValid: true, width: 800, height: 800, format: 'png', aspectRatio: 1 },
      ]);

      const urls = [
        'https://example.com/valid1.jpg',
        'https://example.com/invalid.jpg',
        'https://example.com/valid2.png',
      ];

      const result = await service.getValidImages(urls);

      expect(result.length).toBe(2);
      expect(result).toContain('https://example.com/valid1.jpg');
      expect(result).toContain('https://example.com/valid2.png');
      expect(result).not.toContain('https://example.com/invalid.jpg');
    });
  });
});
