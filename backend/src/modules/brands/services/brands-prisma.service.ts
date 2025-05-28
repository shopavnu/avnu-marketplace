import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BrandsPrismaService {
  constructor(private prisma: PrismaService) {}

  async findAll(options?: { skip?: number; take?: number; includeProducts?: boolean }) {
    const { skip = 0, take = 10, includeProducts = false } = options || {};

    return this.prisma.brand.findMany({
      skip,
      take,
      include: {
        products: includeProducts,
      },
    });
  }

  async findOne(id: string, includeProducts = false) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: includeProducts,
      },
    });
  }

  async create(data: {
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
  }) {
    return this.prisma.brand.create({
      data: {
        name: data.name,
      },
    });
  }

  async update(
    id: string,
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
  ) {
    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.brand.delete({
      where: { id },
    });
  }

  async searchBrands(query: string) {
    return this.prisma.brand.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      include: {
        products: true,
      },
    });
  }

  async getBrandWithProducts(id: string) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            variants: true,
          },
        },
      },
    });
  }
}
