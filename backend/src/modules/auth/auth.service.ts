import { Injectable, UnauthorizedException, forwardRef, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MerchantRegisterDto } from './dto/merchant-register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { MerchantService } from '../merchants/services/merchant.service';
import { Merchant } from '../merchants/entities/merchant.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => MerchantService))
    private readonly merchantService: MerchantService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    return this.generateToken(user);
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    return this.generateToken(user);
  }

  /**
   * Register a new merchant user and create their merchant account
   * @param merchantRegisterDto Merchant registration data
   * @returns JWT token and user data
   */
  async registerMerchant(merchantRegisterDto: MerchantRegisterDto) {
    // Extract user and merchant data from the DTO
    const {
      firstName,
      lastName,
      email,
      password,
      merchantName,
      merchantDescription,
      website,
      categories,
      values,
    } = merchantRegisterDto;

    // Create the user with merchant role
    const user = await this.usersService.create({
      firstName,
      lastName,
      email,
      password,
      role: UserRole.MERCHANT,
      isMerchant: true,
    });

    // Create the merchant entity and associate it with the user
    const merchant = await this.merchantService.create({
      name: merchantName,
      description: merchantDescription,
      website,
      categories,
      values,
      isActive: true,
    });

    // Associate the merchant with the user
    await this.merchantService.associateWithUser(merchant.id, user.id);

    // Generate token with merchant info
    return this.generateToken(user);
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findOne(userId);
    return this.generateToken(user);
  }

  /**
   * Get merchant associated with a user
   * @param userId User ID
   * @returns Merchant entity or null if not found
   */
  private async getMerchantForUser(userId: string): Promise<Merchant | null> {
    try {
      const merchants = await this.merchantService.findByUserId(userId);
      return merchants.length > 0 ? merchants[0] : null;
    } catch (error) {
      console.error('Error fetching merchant for user:', error);
      return null;
    }
  }

  private async generateToken(user: User) {
    // Get merchant ID if user is a merchant
    let merchantId: string | undefined;
    if (user.isMerchant) {
      const merchant = await this.getMerchantForUser(user.id);
      merchantId = merchant?.id;
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isMerchant: user.isMerchant,
      merchantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        isMerchant: user.isMerchant,
        role: user.role,
        merchantId,
      },
    };
  }
}
