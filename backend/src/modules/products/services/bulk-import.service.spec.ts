import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ImportResult as _ImportResult, BulkImportService } from './bulk-import.service';
import { DataNormalizationService, DataSource } from './data-normalization.service';
import { ProductsService } from '../products.service';
import { CreateProductDto as _CreateProductDto } from '../dto/create-product.dto';

// Mock dependencies
jest.mock('./data-normalization.service');
jest.mock('../products.service');

describe('BulkImportService', () => {
  let service: BulkImportService;
  let dataNormalizationService: DataNormalizationService;
  let productsService: ProductsService;
  let _configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkImportService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DataNormalizationService,
          useValue: {
            normalizeProductData: jest.fn(),
            normalizeProduct: jest.fn(),
            updateProductWithDto: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn(),
            findByExternalId: jest.fn(),
            findAll: jest.fn(),
            findByIds: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BulkImportService>(BulkImportService);
    dataNormalizationService = module.get<DataNormalizationService>(DataNormalizationService);
    productsService = module.get<ProductsService>(ProductsService);
    _configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importProducts', () => {
    it('should import products successfully', async () => {
      // Mock raw products
      const rawProducts = [
        { id: 'ext1', title: 'Product 1', price: 19.99 },
        { id: 'ext2', title: 'Product 2', price: 29.99 },
      ];

      // Mock normalized products
      const normalizedProducts = [
        { title: 'Normalized Product 1', price: 19.99, externalId: 'ext1' },
        { title: 'Normalized Product 2', price: 29.99, externalId: 'ext2' },
      ];

      // Mock created products
      const createdProducts = [
        { id: 'prod1', title: 'Normalized Product 1', price: 19.99, externalId: 'ext1' },
        { id: 'prod2', title: 'Normalized Product 2', price: 29.99, externalId: 'ext2' },
      ];

      // Setup mocks
      (dataNormalizationService.normalizeProductData as jest.Mock)
        .mockResolvedValueOnce(normalizedProducts[0])
        .mockResolvedValueOnce(normalizedProducts[1]);

      (productsService.create as jest.Mock)
        .mockResolvedValueOnce(createdProducts[0])
        .mockResolvedValueOnce(createdProducts[1]);

      (productsService.findByExternalId as jest.Mock).mockResolvedValue(null); // No existing products

      // Call the method
      const result = await service.importProducts(rawProducts, {
        source: DataSource.MANUAL,
        merchantId: 'merchant123',
      });

      // Verify results
      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.products).toEqual(['prod1', 'prod2']);
      expect(result.errors).toEqual([]);

      // Verify normalization was called with correct params
      expect(dataNormalizationService.normalizeProductData).toHaveBeenCalledTimes(2);
      expect(dataNormalizationService.normalizeProductData).toHaveBeenCalledWith(
        rawProducts[0],
        DataSource.MANUAL,
        expect.any(Object),
      );

      // Verify create was called with normalized data
      expect(productsService.create).toHaveBeenCalledTimes(2);
      expect(productsService.create).toHaveBeenCalledWith(normalizedProducts[0]);
      expect(productsService.create).toHaveBeenCalledWith(normalizedProducts[1]);
    });

    it('should skip existing products when skipExisting is true', async () => {
      // Mock raw products
      const rawProducts = [
        { externalId: 'ext1', title: 'Product 1', price: 19.99 },
        { externalId: 'ext2', title: 'Product 2', price: 29.99 },
      ];

      // Mock existing product
      const existingProduct = { id: 'existing1', externalId: 'ext1' };

      // Mock normalized product
      const normalizedProduct = { title: 'Normalized Product 2', price: 29.99, externalId: 'ext2' };

      // Mock created product
      const createdProduct = {
        id: 'prod2',
        title: 'Normalized Product 2',
        price: 29.99,
        externalId: 'ext2',
      };

      // Setup mocks
      (productsService.findByExternalId as jest.Mock)
        .mockResolvedValueOnce(existingProduct) // First product exists
        .mockResolvedValueOnce(null); // Second product doesn't exist

      (dataNormalizationService.normalizeProductData as jest.Mock).mockResolvedValueOnce(
        normalizedProduct,
      );

      (productsService.create as jest.Mock).mockResolvedValueOnce(createdProduct);

      // Call the method
      const result = await service.importProducts(rawProducts, {
        source: DataSource.MANUAL,
        skipExisting: true,
      });

      // Verify results
      expect(result.total).toBe(2);
      expect(result.successful).toBe(1); // Only one product was created
      expect(result.failed).toBe(0);
      expect(result.products).toEqual(['prod2']);

      // Verify normalization was called only once (for the second product)
      expect(dataNormalizationService.normalizeProductData).toHaveBeenCalledTimes(1);
      expect(dataNormalizationService.normalizeProductData).toHaveBeenCalledWith(
        rawProducts[1],
        DataSource.MANUAL,
        expect.any(Object),
      );

      // Verify create was called only once
      expect(productsService.create).toHaveBeenCalledTimes(1);
      expect(productsService.create).toHaveBeenCalledWith(normalizedProduct);
    });

    it('should handle errors during import', async () => {
      // Mock raw products
      const rawProducts = [
        { id: 'ext1', title: 'Product 1', price: 19.99 },
        { id: 'ext2', title: 'Product 2', price: 29.99 },
      ];

      // Setup mocks
      (productsService.findByExternalId as jest.Mock).mockResolvedValue(null); // No existing products

      (dataNormalizationService.normalizeProductData as jest.Mock)
        .mockResolvedValueOnce({ title: 'Normalized Product 1', price: 19.99 })
        .mockRejectedValueOnce(new Error('Validation error')); // Second product fails

      (productsService.create as jest.Mock).mockResolvedValueOnce({
        id: 'prod1',
        title: 'Normalized Product 1',
        price: 19.99,
      });

      // Call the method
      const result = await service.importProducts(rawProducts);

      // Verify results
      expect(result.total).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.products).toEqual(['prod1']);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].index).toBe(1);
      expect(result.errors[0].error).toBe('Validation error');
    });

    it('should only validate products when validateOnly is true', async () => {
      // Mock raw products
      const rawProducts = [
        { id: 'ext1', title: 'Product 1', price: 19.99 },
        { id: 'ext2', title: 'Product 2', price: 29.99 },
      ];

      // Mock normalized products
      const normalizedProducts = [
        { title: 'Normalized Product 1', price: 19.99 },
        { title: 'Normalized Product 2', price: 29.99 },
      ];

      // Setup mocks
      (dataNormalizationService.normalizeProductData as jest.Mock)
        .mockResolvedValueOnce(normalizedProducts[0])
        .mockResolvedValueOnce(normalizedProducts[1]);

      // Call the method
      const result = await service.importProducts(rawProducts, {
        validateOnly: true,
      });

      // Verify results
      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.products).toEqual([]);

      // Verify normalization was called
      expect(dataNormalizationService.normalizeProductData).toHaveBeenCalledTimes(2);

      // Verify create was NOT called
      expect(productsService.create).not.toHaveBeenCalled();
    });
  });

  describe('importFromShopify', () => {
    it('should import Shopify products', async () => {
      // Mock Shopify data
      const shopifyData = {
        products: [
          { id: 'shopify1', title: 'Shopify Product 1' },
          { id: 'shopify2', title: 'Shopify Product 2' },
        ],
      };

      // Mock importProducts method
      jest.spyOn(service, 'importProducts').mockResolvedValue({
        total: 2,
        successful: 2,
        failed: 0,
        errors: [],
        products: ['prod1', 'prod2'],
      });

      // Call the method
      const result = await service.importFromShopify(shopifyData);

      // Verify importProducts was called with correct params
      expect(service.importProducts).toHaveBeenCalledWith(
        shopifyData.products,
        expect.objectContaining({ source: DataSource.SHOPIFY }),
      );

      // Verify results
      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
    });
  });

  describe('processExistingProducts', () => {
    it('should process existing products', async () => {
      // Mock existing products
      const existingProducts = [
        { id: 'prod1', title: 'Product 1', images: ['https://example.com/image1.jpg'] },
        { id: 'prod2', title: 'Product 2', images: ['https://example.com/image2.jpg'] },
      ];

      // Mock normalized products
      const normalizedProducts = [
        { id: 'prod1', title: 'Product 1', images: ['https://example.com/processed1.webp'] },
        { id: 'prod2', title: 'Product 2', images: ['https://example.com/processed2.webp'] },
      ];

      // Setup mocks
      (productsService.findByIds as jest.Mock).mockResolvedValue(existingProducts);

      (dataNormalizationService.normalizeProduct as jest.Mock)
        .mockResolvedValueOnce(normalizedProducts[0])
        .mockResolvedValueOnce(normalizedProducts[1]);

      (productsService.update as jest.Mock).mockResolvedValue(undefined);

      // Call the method
      const result = await service.processExistingProducts(['prod1', 'prod2']);

      // Verify results
      expect(result.total).toBe(2);
      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);

      // Verify normalization was called
      expect(dataNormalizationService.normalizeProduct).toHaveBeenCalledTimes(2);

      // Verify update was called
      expect(productsService.update).toHaveBeenCalledTimes(2);
      expect(productsService.update).toHaveBeenCalledWith('prod1', normalizedProducts[0]);
      expect(productsService.update).toHaveBeenCalledWith('prod2', normalizedProducts[1]);
    });

    it('should handle errors during processing', async () => {
      // Mock existing products
      const existingProducts = [
        { id: 'prod1', title: 'Product 1', images: ['https://example.com/image1.jpg'] },
        { id: 'prod2', title: 'Product 2', images: ['https://example.com/image2.jpg'] },
      ];

      // Setup mocks
      (productsService.findAll as jest.Mock).mockResolvedValue(existingProducts);

      (dataNormalizationService.normalizeProduct as jest.Mock)
        .mockResolvedValueOnce({ id: 'prod1', title: 'Product 1' })
        .mockRejectedValueOnce(new Error('Processing error'));

      (productsService.update as jest.Mock).mockResolvedValue(undefined);

      // Call the method
      const result = await service.processExistingProducts();

      // Verify results
      expect(result.total).toBe(2);
      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].id).toBe('prod2');
      expect(result.errors[0].error).toBe('Processing error');
    });
  });
});
