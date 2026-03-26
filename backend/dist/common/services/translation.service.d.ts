interface TranslationResult {
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
}
export declare class TranslationService {
    private readonly logger;
    translate(text: string, fromLang: string, toLang: string): Promise<TranslationResult>;
    private fallbackTranslate;
    getSupportedLanguages(): {
        code: string;
        name: string;
    }[];
}
export {};
