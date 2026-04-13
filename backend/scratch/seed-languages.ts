import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flagIcon: '🇻🇳', isActive: true },
    { code: 'en', name: 'English', flagIcon: '🇺🇸', isActive: true },
    { code: 'zh', name: '中文', flagIcon: '🇨🇳', isActive: true },
    { code: 'ja', name: '日本語', flagIcon: '🇯🇵', isActive: true },
    { code: 'ko', name: '한국어', flagIcon: '🇰🇷', isActive: true },
    { code: 'th', name: 'ไทย', flagIcon: '🇹🇭', isActive: true },
    { code: 'fr', name: 'Français', flagIcon: '🇫🇷', isActive: true },
  ];

  console.log('--- Seeding Languages ---');

  for (const lang of languages) {
    const updated = await prisma.language.upsert({
      where: { code: lang.code },
      update: {
        name: lang.name,
        flagIcon: lang.flagIcon,
        isActive: lang.isActive,
      },
      create: lang,
    });
    console.log(`✓ ${updated.code}: ${updated.name}`);
  }

  console.log('--- Seeding Completed ---');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
