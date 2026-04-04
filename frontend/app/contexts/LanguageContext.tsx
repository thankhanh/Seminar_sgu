import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../constants/api';

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
}

const STORAGE_KEY = '@smart_tour_lang';

const LanguageContext = createContext<LanguageContextType>({
    selectedLanguage: null,
    languages: [],
    isLoading: true,
    setSelectedLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedLanguage, setSelectedLanguageState] = useState<Language | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                // Tải danh sách ngôn ngữ từ backend
                const { data: json } = await api.get('/languages');
                const active: Language[] = (json.data || []).filter((l: Language) => l.isActive);
                setLanguages(active);

                // Khôi phục ngôn ngữ đã chọn từ storage
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved) as Language;
                    // Kiểm tra còn active không
                    const stillActive = active.find(l => l.code === parsed.code);
                    if (stillActive) {
                        setSelectedLanguageState(stillActive);
                        return;
                    }
                }

                // Mặc định: tiếng Việt, hoặc ngôn ngữ đầu tiên
                const vi = active.find(l => l.code === 'vi') ?? active[0];
                if (vi) setSelectedLanguageState(vi);
            } catch (error) {
                console.warn('[LanguageContext] Lỗi tải ngôn ngữ:', error);
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

    return (
        <LanguageContext.Provider value={{ selectedLanguage, languages, isLoading, setSelectedLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
