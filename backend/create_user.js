const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    const email = 'vana@gmail.com';
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: {
        name: 'Nguyễn Văn A',
        email,
        passwordHash,
        role: 'user',
        isActive: true,
      },
    });
    console.log('User created/updated:', JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
