import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CartService } from '../services/cart.service';
import { CartDto } from '../dto/cart.dto';
import { CartItemInput } from '../dto/cart-item.dto';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '@modules/clerk-auth/guards/clerk-auth.guard';
import { GetUser } from '@modules/clerk-auth/decorators/get-user.decorator';

@Resolver(() => CartDto)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => CartDto)
  @UseGuards(ClerkAuthGuard)
  async cart(@GetUser() userId: string): Promise<CartDto> {
    return this.cartService.getCart(userId);
  }

  @Mutation(() => CartDto)
  @UseGuards(ClerkAuthGuard)
  async addToCart(
    @GetUser() userId: string,
    @Args('input') input: CartItemInput,
  ): Promise<CartDto> {
    return this.cartService.addToCart(userId, input);
  }

  @Mutation(() => CartDto)
  @UseGuards(ClerkAuthGuard)
  async updateCartItem(
    @GetUser() userId: string,
    @Args('input') input: CartItemInput,
  ): Promise<CartDto> {
    return this.cartService.updateCartItem(userId, input);
  }

  @Mutation(() => CartDto)
  @UseGuards(ClerkAuthGuard)
  async removeCartItem(
    @GetUser() userId: string,
    @Args('productId') productId: string,
    @Args('variantId', { nullable: true }) variantId?: string,
  ): Promise<CartDto> {
    return this.cartService.removeCartItem(userId, productId, variantId);
  }

  @Mutation(() => CartDto)
  @UseGuards(ClerkAuthGuard)
  async clearCart(@GetUser() userId: string): Promise<CartDto> {
    return this.cartService.clearCart(userId);
  }
}
