import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggerService } from '@common/services/logger.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.debug(`Creating new user with email: ${createUserDto.email}`);
    // Check if user with this email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);
    this.logger.debug(`User created successfully with ID: ${savedUser.id}`);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    this.logger.debug('Finding all users');
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    this.logger.debug(`Finding user with ID: ${id}`);
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    this.logger.debug(`Finding user with email: ${email}`);
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.debug(`Updating user with ID: ${id}`);
    const user = await this.findOne(id);

    // If updating password, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    const updatedUser = this.usersRepository.merge(user, updateUserDto);
    const savedUser = await this.usersRepository.save(updatedUser);
    this.logger.debug(`User updated successfully: ${id}`);
    return savedUser;
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Removing user with ID: ${id}`);
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    this.logger.debug(`Validating user credentials for email: ${email}`);
    const user = await this.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async updateInterests(userId: string, interests: string[]): Promise<User> {
    this.logger.debug(`Updating interests for user ID: ${userId}`);
    this.logger.debug(`New interests: ${interests.join(', ')}`);
    const user = await this.findOne(userId);
    user.interests = interests;
    const savedUser = await this.usersRepository.save(user);
    this.logger.debug(`Email verified successfully for user ID: ${userId}`);
    return savedUser;
  }

  async verifyEmail(userId: string): Promise<User> {
    this.logger.debug(`Verifying email for user ID: ${userId}`);
    const user = await this.findOne(userId);
    user.isEmailVerified = true;
    const savedUser = await this.usersRepository.save(user);
    this.logger.debug(`Email verified successfully for user ID: ${userId}`);
    return savedUser;
  }
}
