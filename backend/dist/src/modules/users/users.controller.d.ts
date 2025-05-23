import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import(".").User>;
    findAll(): Promise<import(".").User[]>;
    findOne(id: string): Promise<import(".").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import(".").User>;
    remove(id: string): Promise<void>;
    updateInterests(id: string, body: {
        interests: string[];
    }): Promise<import(".").User>;
    verifyEmail(id: string): Promise<import(".").User>;
}
