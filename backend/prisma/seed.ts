import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.variant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.user.deleteMany({});

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'Test Customer',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'merchant@example.com',
      name: 'Test Merchant',
    },
  });

  // Create sample brands
  const brand1 = await prisma.brand.create({
    data: {
      name: 'Eco Friendly',
      description: 'A sustainable brand focused on creating eco-friendly products that reduce environmental impact without sacrificing quality or style.',
      logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      websiteUrl: 'https://example.com/eco-friendly',
      socialLinks: {
        instagram: 'https://instagram.com/ecofriendly',
        twitter: 'https://twitter.com/ecofriendly',
        facebook: 'https://facebook.com/ecofriendly'
      },
      supportedCausesInfo: 'We donate 5% of all profits to ocean cleanup initiatives and reforestation projects around the world.',
      foundedYear: 2015,
      location: 'Portland, Oregon',
      values: ['Sustainability', 'Ethical Manufacturing', 'Carbon Neutrality', 'Transparency']
    },
  });

  const brand2 = await prisma.brand.create({
    data: {
      name: 'Modern Living',
      description: 'Modern Living creates minimal, functional home goods designed to make everyday living more beautiful and efficient.',
      logoUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      websiteUrl: 'https://example.com/modern-living',
      socialLinks: {
        instagram: 'https://instagram.com/modernliving',
        pinterest: 'https://pinterest.com/modernliving'
      },
      supportedCausesInfo: 'We partner with Habitat for Humanity to create affordable housing with beautiful design for families in need.',
      foundedYear: 2018,
      location: 'Austin, Texas',
      values: ['Quality Design', 'Functionality', 'Simplicity', 'Affordability']
    },
  });

  const brand3 = await prisma.brand.create({
    data: {
      name: 'Avnu Essentials',
      description: 'Avnu Essentials provides high-quality, everyday products with a focus on durability and timeless design.',
      logoUrl: 'https://images.unsplash.com/photo-1603827457577-609e6f42a45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      websiteUrl: 'https://example.com/avnu-essentials',
      socialLinks: {
        instagram: 'https://instagram.com/avnuessentials',
        twitter: 'https://twitter.com/avnuessentials',
        facebook: 'https://facebook.com/avnuessentials'
      },
      supportedCausesInfo: 'We support education initiatives by donating school supplies to underserved communities and providing scholarships for design students.',
      foundedYear: 2020,
      location: 'Chicago, Illinois',
      values: ['Accessibility', 'Quality', 'Innovation', 'Community']
    },
  });

  // Create sample products with variants
  const product1 = await prisma.product.create({
    data: {
      brandId: brand1.id,
      title: 'Organic Cotton T-Shirt',
      description: 'Made from 100% organic cotton, this t-shirt is both comfortable and environmentally friendly.',
      price: 29.99,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      variants: {
        create: [
          {
            optionName: 'Color',
            optionValue: 'Sage',
            stock: 10,
          },
          {
            optionName: 'Color',
            optionValue: 'Natural',
            stock: 15,
          },
          {
            optionName: 'Color',
            optionValue: 'Black',
            stock: 8,
          },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      brandId: brand2.id,
      title: 'Minimalist Ceramic Vase',
      description: 'A beautiful handcrafted ceramic vase perfect for any modern home decor.',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1612200382989-e8e64892d1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      variants: {
        create: [
          {
            optionName: 'Size',
            optionValue: 'Small',
            stock: 5,
          },
          {
            optionName: 'Size',
            optionValue: 'Medium',
            stock: 8,
          },
          {
            optionName: 'Size',
            optionValue: 'Large',
            stock: 3,
          },
        ],
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      brandId: brand3.id,
      title: 'Sustainable Bamboo Cutting Board',
      description: 'Eco-friendly bamboo cutting board with juice groove and handle.',
      price: 34.99,
      imageUrl: 'https://images.unsplash.com/photo-1595365691689-c2c1e9471880?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      variants: {
        create: [
          {
            optionName: 'Size',
            optionValue: 'Standard',
            stock: 12,
          },
          {
            optionName: 'Size',
            optionValue: 'Large',
            stock: 7,
          },
        ],
      },
    },
  });

  // Create sample wishlist items
  await prisma.wishlistItem.create({
    data: {
      userId: user1.id,
      productId: product1.id,
    },
  });

  await prisma.wishlistItem.create({
    data: {
      userId: user1.id,
      productId: product3.id,
    },
  });

  // Create sample order
  const order = await prisma.order.create({
    data: {
      userId: user1.id,
      total: 84.98, // Sum of ordered items
      items: {
        create: [
          {
            variantId: '1', // This would be replaced with an actual variant ID in a real setup
            quantity: 1,
            price: 34.99,
          },
          {
            variantId: '2', // This would be replaced with an actual variant ID in a real setup
            quantity: 1,
            price: 49.99,
          },
        ],
      },
    },
  });

  console.log(`Seeded database with 2 users, 3 brands, 3 products, 7 variants, 2 wishlist items, and 1 order`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
