import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding max_poi column to merchant_subscriptions...');
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE merchant_subscriptions 
      ADD COLUMN IF NOT EXISTS max_poi INTEGER DEFAULT 1;
    `);
    console.log('Successfully added max_poi column.');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
