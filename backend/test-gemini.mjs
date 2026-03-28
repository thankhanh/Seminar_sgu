/**
 * Script: test-gemini.mjs
 * Mục đích: Test nhanh Gemini API - dịch "tôi yêu việt nam" sang tiếng Anh
 * Có tự retry khi bị rate limit 429
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyCVkU0VyY8YbqGLpUOV1wS0PFdVTKgGfew';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log('🤖 Kiểm tra Gemini AI API...\n');

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const text = 'tôi yêu việt nam';
    const sourceLang = 'vi';
    const targetLang = 'en';

    const prompt = `Bạn là một biên dịch viên chuyên nghiệp về du lịch và ẩm thực. 
Hãy dịch đoạn giới thiệu quán ăn sau từ ${sourceLang} sang mã ngôn ngữ ${targetLang}. 
Yêu cầu: Dịch tự nhiên, cuốn hút, giữ đúng ý nghĩa văn hóa và sự thân thiện. 
Chỉ trả về đoạn văn bản đã dịch, không thêm lời dẫn giải hay dấu ngoặc kép.
Nội dung cần dịch: "${text}"`;

    console.log(`📝 Nguồn (${sourceLang.toUpperCase()}): "${text}"`);

    let lastErr;
    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            console.log(`⏳ Lần thử ${attempt} - Đang gọi API...`);
            const result = await model.generateContent(prompt);
            const translated = result.response.text().replace(/^"|"$/g, '').trim();

            console.log(`\n✅ Dịch (${targetLang.toUpperCase()}): "${translated}"`);
            console.log('\n✅ Gemini AI API hoạt động bình thường!');
            return;
        } catch (err) {
            lastErr = err;
            if (err.status === 429) {
                // Tính thời gian chờ từ response
                let waitSec = 35;
                try {
                    const detail = err.errorDetails?.find(d => d['@type']?.includes('RetryInfo'));
                    if (detail?.retryDelay) waitSec = parseInt(detail.retryDelay) + 2;
                } catch (_) {}
                console.log(`   ⚠️  Rate limit (quá nhiều request). Chờ ${waitSec}s rồi thử lại...`);
                await sleep(waitSec * 1000);
            } else {
                break;
            }
        }
    }

    console.error(`\n❌ Gọi API thất bại sau 5 lần thử:`);
    console.error(`   Status: ${lastErr?.status || 'N/A'}`);
    console.error(`   Message: ${lastErr?.message || lastErr}`);
}

main();
