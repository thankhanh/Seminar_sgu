import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../constants/api';
import { translations } from '../constants/translations';

export interface Language {
    id: string;
    code: string;
    name: string;
    flagIcon: string;
    isActive: boolean;
}

interface LanguageContextType {
    selectedLanguage: Language | null;
    languages: Language[];
    isLoading: boolean;
    setSelectedLanguage: (lang: Language) => void;
    t: (keyPath: string, defaultValue?: string) => string;
}

const STORAGE_KEY = '@smart_tour_lang';

const LanguageContext = createContext<LanguageContextType>({
    selectedLanguage: null,
    languages: [],
    isLoading: true,
    setSelectedLanguage: () => {},
    t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedLanguage, setSelectedLanguageState] = useState<Language | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                // Load languages from backend
                const { data: response } = await api.get('/languages');
                const active: Language[] = (response.data || []).filter((l: Language) => l.isActive);
                setLanguages(active);

                // Restore selected language from storage
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved) as Language;
                    const stillActive = active.find(l => l.code === parsed.code);
                    if (stillActive) {
                        setSelectedLanguageState(stillActive);
                        return;
                    }
                }

                // Default to Vietnamese or first language
                const defaultLang = active.find(l => l.code === 'vi') ?? active[0];
                if (defaultLang) {
                    setSelectedLanguageState(defaultLang);
                }
            } catch (error) {
                console.warn('[LanguageContext] Error loading languages:', error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const setSelectedLanguage = async (lang: Language) => {
        setSelectedLanguageState(lang);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lang));
    };

    /**
     * Translate string based on keyPath (e.g., 'login.welcome_back')
     */
    const t = (keyPath: string, defaultValue?: string): string => {
        const langCode = selectedLanguage?.code || 'vi';
        const keys = keyPath.split('.');
        
        // Source of truth: local translations.ts
        let result: any = translations[langCode] || translations['vi'];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                // Fallback to Vietnamese if key not found in target language
                let fallback = translations['vi'];
                for (const fallbackKey of keys) {
                    if (fallback && fallback[fallbackKey]) {
                        fallback = fallback[fallbackKey];
                    } else {
                        return defaultValue || keyPath;
                    }
                }
                return fallback;
            }
        }
        
        return typeof result === 'string' ? result : (defaultValue || keyPath);
    };

    return (
        <LanguageContext.Provider value={{ selectedLanguage, languages, isLoading, setSelectedLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}

