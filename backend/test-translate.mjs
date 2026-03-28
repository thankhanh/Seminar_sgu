/**
 * Script: test-translate.mjs
 * Dùng @vitalets/google-translate-api - Không cần API Key!
 */
import { translate } from '@vitalets/google-translate-api';

async function main() {
    console.log('🌐 Test dịch bằng Google Translate (không cần API Key)...\n');

    const tests = [
        { text: 'tôi yêu việt nam', to: 'en' },
        { text: 'tôi yêu việt nam', to: 'ja' },
        { text: 'tôi yêu việt nam', to: 'ko' },
        { text: 'tôi yêu việt nam', to: 'zh' },
        { text: 'tôi yêu việt nam', to: 'fr' },
    ];

    for (const t of tests) {
        try {
            const result = await translate(t.text, { from: 'vi', to: t.to });
            console.log(`✅ [${t.to.toUpperCase()}]: ${result.text}`);
        } catch (err) {
            console.error(`❌ [${t.to.toUpperCase()}] Lỗi:`, err.message);
        }
    }

    console.log('\n✅ Hoàn tất!');
}

main();
