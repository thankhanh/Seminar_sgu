import { translate } from '@vitalets/google-translate-api';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log('🔧 Bắt đầu sửa dữ liệu narrations theo đúng ngôn ngữ...\n');

    const nonViNarrations = await prisma.narration.findMany({
        where: { language: { code: { not: 'vi' } } },
        include: { language: true, store: true },
    });

    if (nonViNarrations.length === 0) {
        console.log('✅ Không có bản dịch nào cần sửa.');
        await prisma.$disconnect();
        return;
    }

    console.log(`📋 Tìm thấy ${nonViNarrations.length} bản dịch cần kiểm tra...\n`);

    let fixed = 0;
    let skipped = 0;

    for (const narr of nonViNarrations) {
        const targetCode = narr.language.code;

        const viNarr = await prisma.narration.findFirst({
            where: { storeId: narr.storeId, language: { code: 'vi' } },
        });

        if (!viNarr || !viNarr.textContent) {
            console.log(`  ⚠️  [${narr.store.name}] Không có bản gốc VI → bỏ qua`);
            skipped++;
            continue;
        }

        if (narr.textContent && narr.textContent !== viNarr.textContent) {
            console.log(`  ✅ [${narr.store.name}] (${targetCode.toUpperCase()}) Đã có bản dịch → bỏ qua`);
            skipped++;
            continue;
        }

        console.log(`  🌐 [${narr.store.name}] Dịch VI → ${targetCode.toUpperCase()}...`);
        console.log(`     📝 "${viNarr.textContent.substring(0, 60)}"`);

        try {
            const result = await translate(viNarr.textContent, { from: 'vi', to: targetCode });
            const translated = result.text?.trim();
            if (!translated) throw new Error('Kết quả dịch trống');

            await prisma.narration.update({
                where: { id: narr.id },
                data: { textContent: translated }
            });

            console.log(`     ✅ "${translated.substring(0, 70)}"\n`);
            fixed++;
            await sleep(500);
        } catch (err) {
            console.error(`     ❌ Lỗi: ${err.message}`);
        }
    }

    console.log(`\n🎉 Hoàn tất! Đã sửa: ${fixed} | Bỏ qua: ${skipped}`);
    await prisma.$disconnect();
}

main().catch(async (err) => {
    console.error('❌ Lỗi:', err);
    await prisma.$disconnect();
});
