import { Injectable, Logger } from '@nestjs/common';

interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  /**
   * Dịch văn bản sử dụng Google Translate API (miễn phí).
   * @param text - Nội dung cần dịch
   * @param fromLang - Mã ngôn ngữ nguồn (vd: 'vi', 'en', 'ja', 'ko', 'zh')
   * @param toLang - Mã ngôn ngữ đích (vd: 'en', 'vi', 'ja', 'ko', 'zh')
   * @returns Kết quả dịch
   */
  async translate(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<TranslationResult> {
    if (!text || text.trim().length === 0) {
      return {
        translatedText: '',
        sourceLanguage: fromLang,
        targetLanguage: toLang,
      };
    }

    if (fromLang === toLang) {
      return {
        translatedText: text,
        sourceLanguage: fromLang,
        targetLanguage: toLang,
      };
    }

    try {
      // Dynamic import cho ESM module
      const gTranslate = await import('@vitalets/google-translate-api');
      const translate = (gTranslate as any).translate || (gTranslate as any).default || gTranslate;

      const result = await translate(text, { from: fromLang, to: toLang });

      this.logger.log(
        `Translated from "${fromLang}" to "${toLang}": ${text.substring(0, 50)}...`,
      );

      return {
        translatedText: result.text,
        sourceLanguage: fromLang,
        targetLanguage: toLang,
      };
    } catch (error) {
      this.logger.error(`Translation failed: ${error.message}`, error.stack);

      // Fallback: sử dụng Google Translate URL trực tiếp
      try {
        return await this.fallbackTranslate(text, fromLang, toLang);
      } catch (fallbackError) {
        this.logger.error(
          `Fallback translation also failed: ${fallbackError.message}`,
        );
        throw new Error(
          `Không thể dịch văn bản. Vui lòng thử lại sau. Chi tiết: ${error.message}`,
        );
      }
    }
  }

  /**
   * Fallback: Gọi Google Translate qua HTTP trực tiếp
   */
  private async fallbackTranslate(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<TranslationResult> {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx` +
      `&sl=${encodeURIComponent(fromLang)}` +
      `&tl=${encodeURIComponent(toLang)}` +
      `&dt=t` +
      `&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Translate HTTP error: ${response.status}`);
    }

    const data = await response.json();

    // Response format: [[["translated text","original text",null,null,x],...],...]
    const translatedText = data[0]
      .map((segment: any[]) => segment[0])
      .join('');

    return {
      translatedText,
      sourceLanguage: fromLang,
      targetLanguage: toLang,
    };
  }

  /**
   * Lấy danh sách các ngôn ngữ được hỗ trợ phổ biến
   */
  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'vi', name: 'Tiếng Việt' },
      { code: 'en', name: 'English' },
      { code: 'ja', name: '日本語 (Japanese)' },
      { code: 'ko', name: '한국어 (Korean)' },
      { code: 'zh', name: '中文 (Chinese)' },
      { code: 'fr', name: 'Français (French)' },
      { code: 'de', name: 'Deutsch (German)' },
      { code: 'es', name: 'Español (Spanish)' },
      { code: 'th', name: 'ไทย (Thai)' },
      { code: 'ru', name: 'Русский (Russian)' },
    ];
  }
}
