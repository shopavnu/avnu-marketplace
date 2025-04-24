import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggerService } from '@common/services/logger.service';
export declare class UsersService {
    private readonly usersRepository;
    private readonly logger;
    constructor(usersRepository: Repository<User>, logger: LoggerService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | undefined>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    validateUser(email: string, password: string): Promise<User | null>;
    updateInterests(userId: string, interests: string[]): Promise<User>;
    verifyEmail(userId: string): Promise<User>;
}
