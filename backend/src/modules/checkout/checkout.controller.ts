import { Controller, Post, UseGuards, Req, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { InitiateCheckoutResponseDto } from './dto/initiate-checkout-response.dto'; // Import DTO
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path if necessary
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // For API documentation

// Define a type for the authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    userId: string; // Or 'sub', or whatever property your JWT strategy uses for user ID
    // Add other user properties if available and needed, e.g., email
  };
}

@ApiTags('Checkout')
@ApiBearerAuth() // Indicates that JWT is expected in Authorization header
@Controller('checkout') // Base path for this controller will be /api/checkout
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);

  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard) // Protect this endpoint
  @HttpCode(HttpStatus.OK) // Explicitly set success status code to 200 OK
  @ApiOperation({ summary: 'Initiate checkout process for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Checkout initiated successfully, returns orderId and Stripe clientSecret.',
    type: InitiateCheckoutResponseDto, // Use DTO for Swagger
  })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., empty cart, user issue)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async initiateCheckout(@Req() req: AuthenticatedRequest): Promise<InitiateCheckoutResponseDto> {
    const userId = req.user.userId; // Ensure this matches how your JWT strategy provides the user ID
    this.logger.log(`Received request to initiate checkout for user ${userId}`);
    return this.checkoutService.initiateCheckoutProcess(userId);
  }
}
