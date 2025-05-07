import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopifySyncService } from '../../src/modules/integrations/services/shopify-sync.service';
import { ShopifyService } from '../../src/modules/integrations/services/shopify.service';
import { MerchantPlatformConnection } from '../../src/modules/integrations/entities/merchant-platform-connection.entity';
import { Product } from '../../src/modules/products/entities/product.entity';
import { Order } from '../../src/modules/orders/entities/order.entity';
import { PlatformType, SyncResult } from '../../src/modules/shared';
import { Merchant } from '../../src/modules/merchants/entities/merchant.entity';

// Mock repositories
const mockMerchantPlatformConnectionRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
};

const mockProductRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockOrderRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

// Mock ShopifyService
const mockShopifyService = {
  fetchProducts: jest.fn(),
  fetchOrders: jest.fn(),
  handleWebhook: jest.fn(),
};

describe('ShopifySyncService', () => {
  let service: ShopifySyncService;
  let merchantPlatformConnectionRepo: Repository<MerchantPlatformConnection>;
  let productRepo: Repository<Product>;
  let orderRepo: Repository<Order>;
  let shopifyService: ShopifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifySyncService,
        {
          provide: getRepositoryToken(MerchantPlatformConnection),
          useValue: mockMerchantPlatformConnectionRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: ShopifyService,
          useValue: mockShopifyService,
        },
      ],
    }).compile();

    service = module.get<ShopifySyncService>(ShopifySyncService);
    merchantPlatformConnectionRepo = module.get<Repository<MerchantPlatformConnection>>(
      getRepositoryToken(MerchantPlatformConnection),
    );
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    shopifyService = module.get<ShopifyService>(ShopifyService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapOrderStatus', () => {
    it('should map Shopify order statuses correctly', () => {
      expect(service.mapOrderStatus('paid')).toBe('PAID');
      expect(service.mapOrderStatus('Pending')).toBe('PENDING');
      expect(service.mapOrderStatus('REFUNDED')).toBe('REFUNDED');
      expect(service.mapOrderStatus('partially_refunded')).toBe('PARTIALLY_REFUNDED');
      expect(service.mapOrderStatus('voided')).toBe('VOIDED');
      expect(service.mapOrderStatus('authorized')).toBe('AUTHORIZED');
      expect(service.mapOrderStatus('expired')).toBe('EXPIRED');
      expect(service.mapOrderStatus('declined')).toBe('DECLINED');
    });

    it('should handle unknown status values', () => {
      expect(service.mapOrderStatus('unknown_status')).toBe('UNKNOWN_STATUS');
    });

    it('should handle empty status values', () => {
      expect(service.mapOrderStatus('')).toBe('PENDING');
      expect(service.mapOrderStatus(null)).toBe('PENDING');
      expect(service.mapOrderStatus(undefined)).toBe('PENDING');
    });
  });

  describe('syncProducts', () => {
    it('should throw an error if connection is not a Shopify connection', async () => {
      const connection: MerchantPlatformConnection = {
        id: 123,
        merchantId: 'merchant1',
        merchant: new Merchant(),
        platformType: 'other-platform' as any, // Using string since WOOCOMMERCE no longer exists
        platformStoreName: 'Test Store',
        platformStoreUrl: 'https://teststore.myshopify.com',
        accessToken: 'access-token',
        refreshToken: '',
        tokenExpiresAt: new Date(),
        isActive: true,
        lastSyncedAt: new Date(),
        lastSyncStatus: '',
        lastSyncError: '',
        platformConfig: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await expect(service.syncProducts(connection)).rejects.toThrow(
        'Connection is not a Shopify connection',
      );
    });

    it('should update connection status and save results', async () => {
      // Mock a Shopify connection
      const shopifyConnection: MerchantPlatformConnection = {
        id: 123,
        merchantId: 'merchant1',
        merchant: new Merchant(),
        platformType: PlatformType.SHOPIFY,
        platformStoreName: 'Test Shopify Store',
        platformStoreUrl: 'https://teststore.myshopify.com',
        accessToken: 'access-token',
        refreshToken: '',
        tokenExpiresAt: new Date(),
        isActive: true,
        lastSyncedAt: new Date(),
        lastSyncStatus: '',
        lastSyncError: '',
        platformConfig: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock empty product results
      jest.spyOn(service, 'fetchProducts').mockResolvedValue([]);
      
      // Mock the save function
      mockMerchantPlatformConnectionRepository.save.mockResolvedValue(shopifyConnection);

      // Call the method
      const result = await service.syncProducts(shopifyConnection);

      // Verify status updates
      expect(mockMerchantPlatformConnectionRepository.save).toHaveBeenCalledTimes(2);
      const firstSaveCall = mockMerchantPlatformConnectionRepository.save.mock.calls[0][0];
      expect(firstSaveCall.lastSyncedAt).toBeDefined();
      expect(firstSaveCall.lastSyncStatus).toBe('in_progress');

      const secondSaveCall = mockMerchantPlatformConnectionRepository.save.mock.calls[1][0];
      expect(secondSaveCall.lastSyncStatus).toBe('success');
      expect(secondSaveCall.lastSyncedAt).toBeDefined();
      expect(secondSaveCall.lastSyncError).toBe('');

      // Verify the result structure
      expect(result).toEqual({
        created: 0,
        updated: 0,
        failed: 0,
        total: 0,
        errors: [],
        success: true,
      });
    });

    it('should process products correctly', async () => {
      // Mock a Shopify connection
      const shopifyConnection: MerchantPlatformConnection = {
        id: 123,
        merchantId: 'merchant1',
        merchant: new Merchant(),
        platformType: PlatformType.SHOPIFY,
        platformStoreName: 'Test Shopify Store',
        platformStoreUrl: 'https://teststore.myshopify.com',
        accessToken: 'access-token',
        refreshToken: '',
        tokenExpiresAt: new Date(),
        isActive: true,
        lastSyncedAt: new Date(),
        lastSyncStatus: '',
        lastSyncError: '',
        platformConfig: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock product data
      const mockProducts = [
        { id: '1', title: 'Product 1' },
        { id: '2', title: 'Product 2' },
      ];

      // Mock the fetchProducts function
      jest.spyOn(service, 'fetchProducts').mockResolvedValue(mockProducts);
      
      // Mock the repository save
      mockMerchantPlatformConnectionRepository.save.mockResolvedValue(shopifyConnection);
      
      // Mock the product repository to return null (product doesn't exist)
      mockProductRepository.findOne.mockResolvedValue(null);

      // Call the method
      const result = await service.syncProducts(shopifyConnection);

      // Verify that findOne was called for each product
      expect(mockProductRepository.findOne).toHaveBeenCalledTimes(2);
      
      // Verify the result counts
      expect(result).toEqual({
        created: 2, // Both products should be created
        updated: 0,
        failed: 0,
        total: 2,
        errors: [],
        success: true,
      });
    });

    it('should handle errors during sync', async () => {
      // Mock a Shopify connection
      const shopifyConnection: MerchantPlatformConnection = {
        id: 123,
        merchantId: 'merchant1',
        merchant: new Merchant(),
        platformType: PlatformType.SHOPIFY,
        platformStoreName: 'Test Shopify Store',
        platformStoreUrl: 'https://teststore.myshopify.com',
        accessToken: 'access-token',
        refreshToken: '',
        tokenExpiresAt: new Date(),
        isActive: true,
        lastSyncedAt: new Date(),
        lastSyncStatus: '',
        lastSyncError: '',
        platformConfig: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock fetchProducts to throw an error
      jest.spyOn(service, 'fetchProducts').mockRejectedValue(new Error('API error'));
      
      // Mock the repository save
      mockMerchantPlatformConnectionRepository.save.mockResolvedValue(shopifyConnection);

      // Call the method
      const result = await service.syncProducts(shopifyConnection);

      // Verify connection error status was saved
      expect(mockMerchantPlatformConnectionRepository.save).toHaveBeenCalledTimes(2);
      
      // Verify the error result
      expect(result).toEqual({
        created: 0,
        updated: 0,
        failed: 0,
        total: 0,
        errors: ['API error'],
        success: false,
      });
    });
  });

  describe('syncOrders', () => {
    it('should throw an error if connection is not a Shopify connection', async () => {
      const connection: MerchantPlatformConnection = {
        id: 123,
        merchantId: 'merchant1',
        merchant: new Merchant(),
        platformType: 'other-platform' as any, // Using string since WOOCOMMERCE no longer exists
        platformStoreName: 'Test Store',
        platformStoreUrl: 'https://teststore.myshopify.com',
        accessToken: 'access-token',
        refreshToken: '',
        tokenExpiresAt: new Date(),
        isActive: true,
        lastSyncedAt: new Date(),
        lastSyncStatus: '',
        lastSyncError: '',
        platformConfig: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await expect(service.syncOrders(connection)).rejects.toThrow(
        'Connection is not a Shopify connection',
      );
    });

    it('should process orders correctly', async () => {
      // Mock a Shopify connection
      const shopifyConnection: MerchantPlatformConnection = {
        id: 123,
        merchantId: 'merchant1',
        merchant: new Merchant(),
        platformType: PlatformType.SHOPIFY,
        platformStoreName: 'Test Shopify Store',
        platformStoreUrl: 'https://teststore.myshopify.com',
        accessToken: 'access-token',
        refreshToken: '',
        tokenExpiresAt: new Date(),
        isActive: true,
        lastSyncedAt: new Date(),
        lastSyncStatus: '',
        lastSyncError: '',
        platformConfig: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock order data
      const mockOrders = [
        { id: '1', name: 'Order 1' },
        { id: '2', name: 'Order 2' },
      ];

      // Mock the fetchOrders function
      jest.spyOn(service, 'fetchOrders').mockResolvedValue(mockOrders);
      
      // Mock the order repository to return null (order doesn't exist)
      mockOrderRepository.findOne.mockResolvedValue(null);

      // Call the method
      const result = await service.syncOrders(shopifyConnection);

      // Verify that findOne was called for each order
      expect(mockOrderRepository.findOne).toHaveBeenCalledTimes(2);
      
      // Verify the result counts
      expect(result).toEqual({
        created: 2, // Both orders should be created
        updated: 0,
        failed: 0,
        total: 2,
        errors: [],
        success: true,
      });
    });
  });

  describe('handleWebhook', () => {
    it('should handle product webhooks correctly', async () => {
      // Mock webhook data
      const event = 'product/create';
      const data = { id: '123', title: 'New Product' };
      const merchantId = 'merchant1';

      // Mock connection lookup
      mockMerchantPlatformConnectionRepository.findOne.mockResolvedValue({
        id: '456',
        merchantId,
        platformType: PlatformType.SHOPIFY,
      });

      // Call the method
      const result = await service.handleWebhook(event, data, merchantId);

      // Verify result
      expect(result).toBe(true);
    });

    it('should handle order webhooks correctly', async () => {
      // Mock webhook data
      const event = 'order/updated';
      const data = { id: '123', name: 'Updated Order' };
      const merchantId = 'merchant1';

      // Mock connection lookup
      mockMerchantPlatformConnectionRepository.findOne.mockResolvedValue({
        id: '456',
        merchantId,
        platformType: PlatformType.SHOPIFY,
      });

      // Call the method
      const result = await service.handleWebhook(event, data, merchantId);

      // Verify result
      expect(result).toBe(true);
    });

    it('should handle connection not found', async () => {
      // Mock webhook data with no matching connection
      mockMerchantPlatformConnectionRepository.findOne.mockResolvedValue(null);

      // Call the method
      const result = await service.handleWebhook('product/update', {}, 'nonexistent');

      // Should return false when connection not found
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      // Mock webhook data
      const event = 'product/create';
      const data = { id: '123', title: 'New Product' };

      // Mock connection lookup to throw an error
      mockMerchantPlatformConnectionRepository.findOne.mockRejectedValue(
        new Error('Database error')
      );

      // Call the method
      const result = await service.handleWebhook(event, data);

      // Should return false on error
      expect(result).toBe(false);
    });
  });
});
