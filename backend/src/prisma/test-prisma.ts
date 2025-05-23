import { PrismaClient } from '@prisma/client';

// This is a simple script to test Prisma connection
async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Test the database connection
    console.log('Testing Prisma database connection...');
    
    // Get the database version
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('Database connection successful!');
    console.log('Database version:', result);
    
    // Count existing records
    const brandCount = await prisma.brand.count();
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    
    console.log('Current database statistics:');
    console.log(`- Brands: ${brandCount}`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Users: ${userCount}`);
    
    console.log('Prisma integration is working correctly!');
  } catch (error) {
    console.error('Error testing Prisma connection:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
