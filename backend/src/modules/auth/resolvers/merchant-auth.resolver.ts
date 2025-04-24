import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { MerchantRegisterDto } from '../dto/merchant-register.dto';
import { LoginDto } from '../dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Public } from '../decorators/public.decorator';

@Resolver()
export class MerchantAuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => Object, { description: 'Register a new merchant account' })
  async merchantRegister(@Args('input') merchantRegisterDto: MerchantRegisterDto) {
    return this.authService.registerMerchant(merchantRegisterDto);
  }

  @Public()
  @Mutation(() => Object, { description: 'Login as a merchant' })
  async merchantLogin(@Args('input') loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Object, { description: 'Refresh merchant JWT token' })
  async merchantRefreshToken(@CurrentUser() user: User) {
    return this.authService.refreshToken(user.id);
  }
}
