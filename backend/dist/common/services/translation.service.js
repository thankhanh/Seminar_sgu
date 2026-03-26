"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TranslationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const common_1 = require("@nestjs/common");
let TranslationService = TranslationService_1 = class TranslationService {
    constructor() {
        this.logger = new common_1.Logger(TranslationService_1.name);
    }
    async translate(text, fromLang, toLang) {
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
            const { translate } = await Promise.resolve().then(() => require('@vitalets/google-translate-api'));
            const result = await translate(text, { from: fromLang, to: toLang });
            this.logger.log(`Translated from "${fromLang}" to "${toLang}": ${text.substring(0, 50)}...`);
            return {
                translatedText: result.text,
                sourceLanguage: fromLang,
                targetLanguage: toLang,
            };
        }
        catch (error) {
            this.logger.error(`Translation failed: ${error.message}`, error.stack);
            try {
                return await this.fallbackTranslate(text, fromLang, toLang);
            }
            catch (fallbackError) {
                this.logger.error(`Fallback translation also failed: ${fallbackError.message}`);
                throw new Error(`Không thể dịch văn bản. Vui lòng thử lại sau. Chi tiết: ${error.message}`);
            }
        }
    }
    async fallbackTranslate(text, fromLang, toLang) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx` +
            `&sl=${encodeURIComponent(fromLang)}` +
            `&tl=${encodeURIComponent(toLang)}` +
            `&dt=t` +
            `&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google Translate HTTP error: ${response.status}`);
        }
        const data = await response.json();
        const translatedText = data[0]
            .map((segment) => segment[0])
            .join('');
        return {
            translatedText,
            sourceLanguage: fromLang,
            targetLanguage: toLang,
        };
    }
    getSupportedLanguages() {
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
};
exports.TranslationService = TranslationService;
exports.TranslationService = TranslationService = TranslationService_1 = __decorate([
    (0, common_1.Injectable)()
], TranslationService);
//# sourceMappingURL=translation.service.js.map