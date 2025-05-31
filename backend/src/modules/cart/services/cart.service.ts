import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartDto } from '../dto/cart.dto';
import { CartItemDto, CartItemInput } from '../dto/cart-item.dto';
import { PrismaService } from '../../../prisma';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly cartTtlMs: number;

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // Get TTL from config or use default of 30 days (in milliseconds)
    this.cartTtlMs = this.configService.get<number>('CART_TTL_DAYS', 30) * 24 * 60 * 60 * 1000;
  }

  private getCacheKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<CartDto> {
    // First try to get from cache
    const cachedCart = await this.cacheManager.get<CartDto>(this.getCacheKey(userId));
    if (cachedCart) {
      return cachedCart;
    }

    // If not in cache, get from database
    let cart = await this.cartRepository.findOne({ where: { userId } });

    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = await this.cartRepository.save({
        userId,
        items: '[]',
        lastActive: new Date(),
      });
    }

    // Parse items and calculate totals
    const items = JSON.parse(cart.items) as CartItemDto[];
    const subtotal = this.calculateSubtotal(items);

    const cartDto: CartDto = {
      id: cart.id,
      userId: cart.userId,
      items,
      subtotal,
      total: subtotal, // We'll add tax calculation later
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      lastActive: cart.lastActive,
    };

    // Store in cache
    await this.cacheManager.set(this.getCacheKey(userId), cartDto, this.cartTtlMs);

    return cartDto;
  }

  async addToCart(userId: string, cartItem: CartItemInput): Promise<CartDto> {
    // Get existing cart
    let cart = await this.cartRepository.findOne({ where: { userId } });
    let items: CartItemDto[] = [];

    if (cart) {
      items = JSON.parse(cart.items) as CartItemDto[];
    } else {
      // Create new cart if it doesn't exist
      cart = await this.cartRepository.save({
        userId,
        items: '[]',
        lastActive: new Date(),
      });
    }

    // Check if product exists and get price
    const product = await this.prisma.product.findUnique({
      where: { id: cartItem.productId },
      select: { id: true, price: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${cartItem.productId} not found`);
    }

    // Check if item already exists in cart
    const existingItemIndex = items.findIndex(
      item => item.productId === cartItem.productId && item.variantId === cartItem.variantId,
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      items[existingItemIndex].quantity += cartItem.quantity;
    } else {
      // Add new item
      items.push({
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        price: product.price,
        quantity: cartItem.quantity,
        addedAt: new Date(),
      });
    }

    // Update cart in database
    cart.items = JSON.stringify(items);
    cart.lastActive = new Date();
    await this.cartRepository.save(cart);

    // Clear cache
    await this.cacheManager.del(this.getCacheKey(userId));

    // Return updated cart
    return this.getCart(userId);
  }

  async updateCartItem(userId: string, cartItem: CartItemInput): Promise<CartDto> {
    const cart = await this.cartRepository.findOne({ where: { userId } });

    if (!cart) {
      throw new NotFoundException(`Cart for user ${userId} not found`);
    }

    const items = JSON.parse(cart.items) as CartItemDto[];
    const itemIndex = items.findIndex(
      item => item.productId === cartItem.productId && item.variantId === cartItem.variantId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(`Item with product ID ${cartItem.productId} not found in cart`);
    }

    if (cartItem.quantity <= 0) {
      // Remove item if quantity is 0 or negative
      items.splice(itemIndex, 1);
    } else {
      // Update quantity
      items[itemIndex].quantity = cartItem.quantity;
    }

    // Update cart in database
    cart.items = JSON.stringify(items);
    cart.lastActive = new Date();
    await this.cartRepository.save(cart);

    // Clear cache
    await this.cacheManager.del(this.getCacheKey(userId));

    // Return updated cart
    return this.getCart(userId);
  }

  async removeCartItem(userId: string, productId: string, variantId?: string): Promise<CartDto> {
    const cart = await this.cartRepository.findOne({ where: { userId } });

    if (!cart) {
      throw new NotFoundException(`Cart for user ${userId} not found`);
    }

    const items = JSON.parse(cart.items) as CartItemDto[];
    const updatedItems = items.filter(
      item => !(item.productId === productId && item.variantId === variantId),
    );

    // Update cart in database
    cart.items = JSON.stringify(updatedItems);
    cart.lastActive = new Date();
    await this.cartRepository.save(cart);

    // Clear cache
    await this.cacheManager.del(this.getCacheKey(userId));

    // Return updated cart
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartDto> {
    const cart = await this.cartRepository.findOne({ where: { userId } });

    if (!cart) {
      throw new NotFoundException(`Cart for user ${userId} not found`);
    }

    // Clear items
    cart.items = '[]';
    cart.lastActive = new Date();
    await this.cartRepository.save(cart);

    // Clear cache
    await this.cacheManager.del(this.getCacheKey(userId));

    // Return empty cart
    return this.getCart(userId);
  }

  private calculateSubtotal(items: CartItemDto[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}
