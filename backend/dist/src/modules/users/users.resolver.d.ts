import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersResolver {
  private readonly usersService;
  constructor(usersService: UsersService);
  createUser(createUserDto: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User>;
  updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  removeUser(id: string): boolean;
  updateUserInterests(id: string, interests: string[]): Promise<User>;
  verifyUserEmail(id: string): Promise<User>;
}
