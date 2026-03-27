"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Bắt đầu seed database...');
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
    const bcrypt = await Promise.resolve().then(() => require('bcryptjs'));
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
//# sourceMappingURL=seed.js.map