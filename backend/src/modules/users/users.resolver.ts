import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(GqlAuthGuard)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeUser(@Args('id', { type: () => ID }) id: string) {
    this.usersService.remove(id);
    return true;
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  updateUserInterests(
    @Args('id', { type: () => ID }) id: string,
    @Args('interests', { type: () => [String] }) interests: string[],
  ) {
    return this.usersService.updateInterests(id, interests);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  verifyUserEmail(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.verifyEmail(id);
  }
}
