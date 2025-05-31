import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { CartDto } from '../dto/cart.dto';
import { CartItemInput } from '../dto/cart-item.dto';
import { ClerkAuthGuard } from '@modules/clerk-auth/guards/clerk-auth.guard';
import { GetUser } from '@modules/clerk-auth/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Returns the user cart', type: CartDto })
  async getCart(@GetUser() userId: string): Promise<CartDto> {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart', type: CartDto })
  async addToCart(@GetUser() userId: string, @Body() item: CartItemInput): Promise<CartDto> {
    return this.cartService.addToCart(userId, item);
  }

  @Put('items')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart item' })
  @ApiResponse({ status: 200, description: 'Cart item updated', type: CartDto })
  async updateCartItem(@GetUser() userId: string, @Body() item: CartItemInput): Promise<CartDto> {
    return this.cartService.updateCartItem(userId, item);
  }

  @Delete('items/:productId')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart', type: CartDto })
  async removeCartItem(
    @GetUser() userId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId?: string,
  ): Promise<CartDto> {
    return this.cartService.removeCartItem(userId, productId, variantId);
  }

  @Delete()
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared', type: CartDto })
  async clearCart(@GetUser() userId: string): Promise<CartDto> {
    return this.cartService.clearCart(userId);
  }
}
