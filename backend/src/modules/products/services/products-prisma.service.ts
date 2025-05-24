import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ProductsPrismaService {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: {
    skip?: number;
    take?: number;
    includeVariants?: boolean;
    includeBrand?: boolean;
  }) {
    const { skip = 0, take = 10, includeVariants = true, includeBrand = true } = options || {};

    return this.prisma.product.findMany({
      skip,
      take,
      include: {
        variants: includeVariants,
        brand: includeBrand,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        variants: true,
      },
    });
  }

  async create(data: {
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    brandId: string;
    variants?: {
      optionName: string;
      optionValue: string;
      stock: number;
    }[];
  }) {
    return this.prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        brandId: data.brandId,
        variants: data.variants
          ? {
              create: data.variants.map(variant => ({
                optionName: variant.optionName,
                optionValue: variant.optionValue,
                stock: variant.stock,
              })),
            }
          : undefined,
      },
      include: {
        brand: true,
        variants: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      brandId?: string;
    },
  ) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        brand: true,
        variants: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async searchProducts(query: string) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        brand: true,
        variants: true,
      },
    });
  }

  async getProductsByBrand(brandId: string) {
    return this.prisma.product.findMany({
      where: { brandId },
      include: {
        variants: true,
      },
    });
  }
}
