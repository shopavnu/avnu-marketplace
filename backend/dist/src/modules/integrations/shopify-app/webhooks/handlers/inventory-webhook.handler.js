'use strict';
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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var InventoryWebhookHandler_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.InventoryWebhookHandler = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const webhook_handler_interface_1 = require('../webhook-handler.interface');
const merchant_platform_connection_entity_1 = require('../../../entities/merchant-platform-connection.entity');
const platform_type_enum_1 = require('../../../enums/platform-type.enum');
let InventoryWebhookHandler = (InventoryWebhookHandler_1 = class InventoryWebhookHandler extends (
  webhook_handler_interface_1.BaseWebhookHandler
) {
  constructor(merchantPlatformConnectionRepository) {
    super(['inventory_levels/update', 'inventory_items/update', 'inventory_items/delete']);
    this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
    this.logger = new common_1.Logger(InventoryWebhookHandler_1.name);
  }
  async process(context) {
    try {
      const { shop, payload, topic } = context;
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return this.createErrorResult(
          new Error(`No merchant found for shop ${shop}`),
          'Merchant not found',
        );
      }
      if (topic === 'inventory_levels/update') {
        await this.handleInventoryLevelUpdate(merchantId, payload);
      } else if (topic === 'inventory_items/update') {
        await this.handleInventoryItemUpdate(merchantId, payload);
      } else if (topic === 'inventory_items/delete') {
        await this.handleInventoryItemDelete(merchantId, payload);
      } else {
        this.logger.warn(`Unhandled inventory event: ${topic}`);
        return this.createErrorResult(
          new Error(`Unhandled inventory event: ${topic}`),
          'Unknown inventory event',
        );
      }
      return this.createSuccessResult(`Successfully processed ${topic} webhook`, {
        merchantId,
        inventoryData: {
          itemId: payload.inventory_item_id || payload.id,
          locationId: payload.location_id,
        },
      });
    } catch (error) {
      this.logger.error(`Error processing inventory webhook: ${error.message}`, error.stack);
      return this.createErrorResult(error, `Failed to process inventory webhook: ${error.message}`);
    }
  }
  async handleInventoryLevelUpdate(merchantId, data) {
    this.logger.log(
      `Inventory level updated for item ${data.inventory_item_id} at location ${data.location_id} to ${data.available}`,
    );
  }
  async handleInventoryItemUpdate(merchantId, data) {
    this.logger.log(`Inventory item updated: ${data.id} for merchant ${merchantId}`);
  }
  async handleInventoryItemDelete(merchantId, data) {
    this.logger.log(`Inventory item deleted: ${data.id} for merchant ${merchantId}`);
  }
  async getMerchantIdByShop(shop) {
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: {
        platformType: platform_type_enum_1.PlatformType.SHOPIFY,
        platformIdentifier: shop,
        isActive: true,
      },
    });
    return connection ? connection.merchantId : null;
  }
});
exports.InventoryWebhookHandler = InventoryWebhookHandler;
exports.InventoryWebhookHandler =
  InventoryWebhookHandler =
  InventoryWebhookHandler_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(
          0,
          (0, typeorm_1.InjectRepository)(
            merchant_platform_connection_entity_1.MerchantPlatformConnection,
          ),
        ),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      InventoryWebhookHandler,
    );
//# sourceMappingURL=inventory-webhook.handler.js.map
