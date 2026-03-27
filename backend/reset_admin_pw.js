const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    const user = await prisma.user.update({
      where: { email: 'admin@vinhkhanh.vn' },
      data: { passwordHash, isActive: true }
    });
    console.log('Password reset successfully for:', user.email);
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
