import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncService } from '../../src/modules/integrations/services/sync.service.fixed';
import { ShopifySyncService } from '../../src/modules/integrations/services/shopify-sync.service';
import { ShopifyService } from '../../src/modules/integrations/services/shopify.service';
import { MerchantPlatformConnection } from '../../src/modules/integrations/entities/merchant-platform-connection.entity';
import { Product } from '../../src/modules/products/entities/product.entity';
import { Order } from '../../src/modules/orders/entities/order.entity';
import { PlatformType, SyncResult } from '../../src/modules/shared';
import { Merchant } from '../../src/modules/merchants/entities/merchant.entity';

describe('Platform Integration System', () => {
  let syncService: SyncService;
  let shopifySyncService: ShopifySyncService;
  let shopifyService: ShopifyService;
  let merchantPlatformConnectionRepo: Repository<MerchantPlatformConnection>;
  let productRepo: Repository<Product>;
  let orderRepo: Repository<Order>;

  // Mock repositories
  const mockMerchantPlatformConnectionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockOrderRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  // Mock services
  const mockShopifyService = {
    fetchProducts: jest.fn(),
    fetchOrders: jest.fn(),
    handleWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
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

    syncService = module.get<SyncService>(SyncService);
    shopifySyncService = module.get<ShopifySyncService>(ShopifySyncService);
    shopifyService = module.get<ShopifyService>(ShopifyService);
    merchantPlatformConnectionRepo = module.get<Repository<MerchantPlatformConnection>>(
      getRepositoryToken(MerchantPlatformConnection),
    );
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('syncMerchantProducts', () => {
    it('should sync products from all active platform connections', async () => {
      const merchantId = 'merchant123';

      // Mock finding active connections for the merchant
      const mockConnections = [
        {
          id: 1,
          merchantId,
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
        },
      ];
      mockMerchantPlatformConnectionRepository.find.mockResolvedValue(mockConnections);

      // Mock the platform-specific sync services
      jest.spyOn(shopifySyncService, 'syncProducts').mockResolvedValue({
        created: 5,
        updated: 2,
        failed: 1,
        total: 8,
        errors: [],
        success: true,
      });

      // Call the method
      const result = await syncService.syncMerchantProducts(merchantId);

      // Verify platform-specific services were called
      expect(shopifySyncService.syncProducts).toHaveBeenCalledWith(mockConnections[0]);

      // Verify total products synced (5+2 = 7)
      expect(result).toBe(7);
    });

    it('should handle errors when syncing products', async () => {
      const merchantId = 'merchant123';
      const mockConnections = [
        {
          id: 1,
          merchantId,
          merchant: new Merchant(),
          platformType: PlatformType.SHOPIFY,
          platformStoreName: 'Test Shopify Store 1',
          platformStoreUrl: 'https://teststore1.myshopify.com',
          accessToken: 'access-token-1',
          refreshToken: '',
          tokenExpiresAt: new Date(),
          isActive: true,
          lastSyncedAt: new Date(),
          lastSyncStatus: '',
          lastSyncError: '',
          platformConfig: {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          merchantId,
          merchant: new Merchant(),
          platformType: PlatformType.SHOPIFY,
          platformStoreName: 'Test Shopify Store 2',
          platformStoreUrl: 'https://teststore2.myshopify.com',
          accessToken: 'access-token-2',
          refreshToken: '',
          tokenExpiresAt: new Date(),
          isActive: true,
          lastSyncedAt: new Date(),
          lastSyncStatus: '',
          lastSyncError: '',
          platformConfig: {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ];

      // Mock finding connections
      mockMerchantPlatformConnectionRepository.find.mockResolvedValue(mockConnections);

      // Mock first Shopify connection sync to fail
      jest.spyOn(shopifySyncService, 'syncProducts')
        .mockImplementation((connection: MerchantPlatformConnection) => {
          if (connection.id === 1) {
            return Promise.reject(new Error('Shopify API error'));
          } else {
            return Promise.resolve({
              created: 3,
              updated: 4,
              failed: 0,
              total: 7,
              errors: [],
              success: true,
            });
          }
        });

      // Call the method - it should not throw an error
      const result = await syncService.syncMerchantProducts(merchantId);

      // Verify total products synced (only from the second connection, 3+4 = 7)
      expect(result).toBe(7);

      // Verify service was called for both connections
      expect(shopifySyncService.syncProducts).toHaveBeenCalledWith(mockConnections[0]);
      expect(shopifySyncService.syncProducts).toHaveBeenCalledWith(mockConnections[1]);
    });
  });

  describe('handleWebhookEvent', () => {
    it('should route Shopify webhooks to ShopifySyncService', async () => {
      // Mock webhook data
      const event = 'products/update';
      const data = { id: '123', title: 'Updated Product' };
      const merchantId = 'merchant123';

      // Mock ShopifySyncService to return success
      jest.spyOn(shopifySyncService, 'handleWebhook').mockResolvedValue(true);

      // Call the method
      const result = await syncService.handleWebhookEvent(
        PlatformType.SHOPIFY,
        event,
        data,
        merchantId
      );

      // Verify ShopifySyncService was called
      expect(shopifySyncService.handleWebhook).toHaveBeenCalledWith(event, data, merchantId);
      expect(result).toBe(true);
    });

    it('should handle unsupported platform types gracefully', async () => {
      // Mock webhook data with unsupported platform
      const event = 'product.updated';
      const data = { id: '123' };
      const merchantId = 'merchant123';

      // Call the method with unsupported platform type
      const result = await syncService.handleWebhookEvent(
        'unsupported' as any,
        event,
        data,
        merchantId
      );

      // Verify no services were called and result is false
      expect(shopifySyncService.handleWebhook).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('syncConnection', () => {
    it('should perform sync for a specific connection', async () => {
      // Mock connection
      const connectionId = 123;
      const mockConnection: MerchantPlatformConnection = {
        id: connectionId,
        merchantId: 'merchant123',
        merchant: new Merchant(),
        platformType: PlatformType.SHOPIFY,
        platformStoreName: 'Test Shopify Store',
        platformStoreUrl: 'https://teststore.myshopify.com',
        accessToken: 'access-token',
        refreshToken: '',
        tokenExpiresAt: new Date(),
        isActive: true,
        lastSyncedAt: new Date(),
        lastSyncStatus: 'success',
        lastSyncError: '',
        platformConfig: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock finding the connection
      mockMerchantPlatformConnectionRepository.findOne.mockResolvedValue(mockConnection);
      mockMerchantPlatformConnectionRepository.save.mockResolvedValue(mockConnection);

      // Mock sync results
      jest.spyOn(shopifySyncService, 'syncProducts').mockResolvedValue({
        created: 2,
        updated: 3,
        failed: 0,
        total: 5,
        errors: [],
        success: true,
      });

      jest.spyOn(shopifySyncService, 'syncOrders').mockResolvedValue({
        created: 1,
        updated: 2,
        failed: 0,
        total: 3,
        errors: [],
        success: true,
      });

      // Call the method
      const result = await syncService.syncConnection(connectionId.toString());

      // Verify connection was found and syncs were performed
      expect(mockMerchantPlatformConnectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: connectionId }
      });
      expect(shopifySyncService.syncProducts).toHaveBeenCalledWith(mockConnection);
      expect(shopifySyncService.syncOrders).toHaveBeenCalledWith(mockConnection);
      expect(result).toBe(true);
    });

    it('should return false when connection is not found', async () => {
      // Mock connection not found
      mockMerchantPlatformConnectionRepository.findOne.mockResolvedValue(null);

      // Call the method
      const result = await syncService.syncConnection('999');

      // Verify no syncs were performed
      expect(shopifySyncService.syncProducts).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should not start sync when one is already in progress', async () => {
      // Mock connection with in_progress status
      const connectionId = 123;
      const lastSyncStarted = new Date(); // Current time
      const mockConnection: MerchantPlatformConnection = {
        id: connectionId,
        merchantId: 'merchant123',
        merchant: new Merchant(),
        platformType: PlatformType.SHOPIFY,
        platformStoreName: 'Test Store',
        platformStoreUrl: 'https://teststore.myshopify.com',
        accessToken: 'access-token',
        refreshToken: '',
        tokenExpiresAt: new Date(),
        isActive: true,
        lastSyncedAt: new Date(),
        lastSyncStatus: 'in_progress',
        lastSyncError: '',
        platformConfig: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock finding the connection
      mockMerchantPlatformConnectionRepository.findOne.mockResolvedValue(mockConnection);

      // Call the method
      const result = await syncService.syncConnection(connectionId.toString());

      // Verify no syncs were performed
      expect(shopifySyncService.syncProducts).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
