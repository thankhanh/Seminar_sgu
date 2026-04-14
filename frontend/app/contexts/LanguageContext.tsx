import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { languagesHelpers, TOKEN_KEY } from '../constants/api';
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
    setSelectedLanguage: () => { },
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
                const response = await languagesHelpers.getLanguages();
                const active: Language[] = (response || []).filter((l: Language) => l.isActive);
                setLanguages(active);

                // Restore selected language from storage
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                let currentLang: Language | null = null;

                if (saved) {
                    const parsed = JSON.parse(saved) as Language;
                    currentLang = active.find(l => l.code === parsed.code) || null;
                }

                // Default to Vietnamese or first available language if no saved lang or saved lang is inactive
                if (!currentLang) {
                    currentLang = active.find(l => l.code === 'vi') ?? active[0];
                }

                if (currentLang) {
                    setSelectedLanguageState(currentLang);

                    // --- TRUY VẤN LẠI OFFLINE NẾU ĐÃ LOGIN ---
                    const token = await AsyncStorage.getItem(TOKEN_KEY);
                    if (token) {
                        try {
                            const { OfflineService } = require('../services/OfflineService');
                            OfflineService.syncResources(currentLang.code);
                        } catch (e) {
                            console.warn('[LanguageContext] Parallel sync failed:', e);
                        }
                    }
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

