'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var UsersService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.UsersService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const user_entity_1 = require('./entities/user.entity');
const logger_service_1 = require('../../common/services/logger.service');
const bcrypt = __importStar(require('bcrypt'));
let UsersService = (UsersService_1 = class UsersService {
  constructor(usersRepository, logger) {
    this.usersRepository = usersRepository;
    this.logger = logger;
    this.logger.setContext(UsersService_1.name);
  }
  async create(createUserDto) {
    this.logger.debug(`Creating new user with email: ${createUserDto.email}`);
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new common_1.ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(newUser);
    this.logger.debug(`User created successfully with ID: ${savedUser.id}`);
    return savedUser;
  }
  async findAll() {
    this.logger.debug('Finding all users');
    return this.usersRepository.find();
  }
  async findOne(id) {
    this.logger.debug(`Finding user with ID: ${id}`);
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new common_1.NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  async findByEmail(email) {
    this.logger.debug(`Finding user with email: ${email}`);
    return this.usersRepository.findOne({ where: { email } });
  }
  async update(id, updateUserDto) {
    this.logger.debug(`Updating user with ID: ${id}`);
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = this.usersRepository.merge(user, updateUserDto);
    const savedUser = await this.usersRepository.save(updatedUser);
    this.logger.debug(`User updated successfully: ${id}`);
    return savedUser;
  }
  async remove(id) {
    this.logger.debug(`Removing user with ID: ${id}`);
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new common_1.NotFoundException(`User with ID ${id} not found`);
    }
  }
  async validateUser(email, password) {
    this.logger.debug(`Validating user credentials for email: ${email}`);
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
  async updateInterests(userId, interests) {
    this.logger.debug(`Updating interests for user ID: ${userId}`);
    this.logger.debug(`New interests: ${interests.join(', ')}`);
    const user = await this.findOne(userId);
    user.interests = interests;
    const savedUser = await this.usersRepository.save(user);
    this.logger.debug(`Email verified successfully for user ID: ${userId}`);
    return savedUser;
  }
  async verifyEmail(userId) {
    this.logger.debug(`Verifying email for user ID: ${userId}`);
    const user = await this.findOne(userId);
    user.isEmailVerified = true;
    const savedUser = await this.usersRepository.save(user);
    this.logger.debug(`Email verified successfully for user ID: ${userId}`);
    return savedUser;
  }
});
exports.UsersService = UsersService;
exports.UsersService =
  UsersService =
  UsersService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
        __metadata('design:paramtypes', [typeorm_2.Repository, logger_service_1.LoggerService]),
      ],
      UsersService,
    );
//# sourceMappingURL=users.service.js.map
