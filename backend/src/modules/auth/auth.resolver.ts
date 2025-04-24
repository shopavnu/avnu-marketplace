import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { Public } from './decorators/public.decorator';
import { AuthResponse } from './types/auth-response.type';
import { User } from '../users/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async profile(@Context() context) {
    return context.req.user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AuthResponse)
  async refreshToken(@Context() context) {
    return this.authService.refreshToken(context.req.user.id);
  }
}
