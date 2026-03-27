require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    const user = await prisma.user.findUnique({
      where: { email: 'admin@vinhkhanh.vn' },
      select: { id: true, email: true, role: true, isActive: true }
    });
    console.log('Admin User:', JSON.stringify(user, null, 2));
    
    const count = await prisma.user.count();
    console.log('Total Users:', count);
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
