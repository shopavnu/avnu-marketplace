import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

/**
 * WebSocket gateway responsible for pushing cart-related updates to connected clients.
 *
 * Namespace: /cart
 * Events emitted:
 *  – cartUpdated: { userId?: string, items: CartItemDto[] }
 *  – priceStockChanged: { items: { productId: string; price?: number; inStock?: boolean }[] }
 *
 * The gateway exposes a `broadcastCartUpdated` method so that services/controllers
 * (e.g., CartService, CheckoutService) can push updates after any mutation.
 */
@WebSocketGateway({ namespace: 'cart', cors: true })
export class CartGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server!: Server;

  handleConnection(socket: any) {
    // console.log('Client connected to cart namespace', socket.id);
  }

  handleDisconnect(socket: any) {
    // console.log('Client disconnected from cart namespace', socket.id);
  }

  /**
   * Broadcast the entire updated cart payload to clients.
   */
  broadcastCartUpdated(payload: any) {
    this.server.emit('cartUpdated', payload);
  }

  /**
   * Broadcast selective price / stock changes so clients can display notices.
   */
  broadcastPriceStockChanged(payload: any) {
    this.server.emit('priceStockChanged', payload);
  }
}
