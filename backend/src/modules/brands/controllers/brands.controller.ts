import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BrandsPrismaService } from '../services/brands-prisma.service';
import { ClerkAuthGuard, Public, GetUser } from '@modules/clerk-auth';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsPrismaService) {}

  @Public()
  @Get()
  async list(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.brandsService.findAll({
      skip,
      take,
      includeProducts: false,
    });
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string, @Query('includeProducts') includeProducts?: boolean) {
    return this.brandsService.findOne(id, includeProducts === true);
  }

  @Public()
  @Get(':id/products')
  async getBrandProducts(@Param('id') id: string) {
    return this.brandsService.getBrandWithProducts(id);
  }

  // Protected routes - require authentication

  @UseGuards(ClerkAuthGuard)
  @Post()
  async create(
    @Body()
    data: {
      name: string;
      description?: string;
      logoUrl?: string;
      websiteUrl?: string;
      socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
      };
      supportedCausesInfo?: string;
      foundedYear?: number;
      location?: string;
      values?: string[];
    },
    @GetUser('userId') userId: string,
  ) {
    // In a real application, you would validate that the user has permission to create a brand
    // For example, check if they have a merchant/seller role
    console.log(`User ${userId} is creating a brand`);

    return this.brandsService.create(data);
  }

  @UseGuards(ClerkAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      logoUrl?: string;
      websiteUrl?: string;
      socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
      };
      supportedCausesInfo?: string;
      foundedYear?: number;
      location?: string;
      values?: string[];
    },
    @GetUser('userId') userId: string,
  ) {
    // In a real application, you would validate that the user owns this brand
    console.log(`User ${userId} is updating brand ${id}`);

    return this.brandsService.update(id, data);
  }

  @UseGuards(ClerkAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    // In a real application, you would validate that the user owns this brand
    console.log(`User ${userId} is deleting brand ${id}`);

    return this.brandsService.remove(id);
  }
}
