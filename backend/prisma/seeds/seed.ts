import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed dữ liệu ban đầu cho database:
 * - Ngôn ngữ mặc định (6 ngôn ngữ)
 * - Tài khoản Admin mặc định
 */
async function main() {
  console.log('🌱 Bắt đầu seed database...');

  // 1. Seed Languages
  const languages = [
    { code: 'vi', name: 'Vietnamese', flagIcon: '🇻🇳' },
    { code: 'en', name: 'English', flagIcon: '🇬🇧' },
    { code: 'zh', name: 'Chinese', flagIcon: '🇨🇳' },
    { code: 'ko', name: 'Korean', flagIcon: '🇰🇷' },
    { code: 'ja', name: 'Japanese', flagIcon: '🇯🇵' },
    { code: 'fr', name: 'French', flagIcon: '🇫🇷' },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
    console.log(`  ✅ Language: ${lang.flagIcon} ${lang.name}`);
  }

  // 2. Seed Admin account
  const bcrypt = await import('bcryptjs');
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@vinhkhanh.vn' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@vinhkhanh.vn',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true,
    },
  });
  console.log('  ✅ Admin account: admin@vinhkhanh.vn / Admin@123');

  console.log('\n✅ Seed hoàn thành!');
  console.log('⚠️  Nhớ đổi mật khẩu admin sau khi deploy production!\n');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
