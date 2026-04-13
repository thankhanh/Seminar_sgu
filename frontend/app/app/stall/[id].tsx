import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Animated, Alert, StatusBar, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import api, { authHelpers, languagesHelpers, narrationsHelpers, storeHelpers, usersHelpers } from '../../constants/api';

import { useLanguage } from '../../contexts/LanguageContext';

interface StoreDetail {
    id: string;
    name: string;
    address: string;
    description?: string;
    coverImage?: string;
    openTime?: string;
    closeTime?: string;
    status: string;
    merchant?: { businessName: string };
}

interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
}

interface Language {
    id: string;
    code: string;
    name: string;
    flagIcon: string;
}

interface Narration {
    id?: string;
    textContent?: string;
    language: Language;
    isManual?: boolean;
}

const SPEECH_LANG_MAP: Record<string, string> = {
    vi: 'vi-VN', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', ja: 'ja-JP', fr: 'fr-FR',
};

export default function StallDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const storeId = params?.id as string;
    const autoplay = params?.autoplay === '1';
    const { selectedLanguage, languages, t } = useLanguage();

    const [store, setStore] = useState<StoreDetail | null>(null);
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [manualNarrations, setManualNarrations] = useState<Narration[]>([]);
    const [autoNarrations, setAutoNarrations] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    // Fix: Initialize with selectedLanguage to avoid undefined.code crashes
    const [activeLangCode, setActiveLangCode] = useState<string>(selectedLanguage?.code || 'vi');
    const [isLimitReached, setIsLimitReached] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pulse animation
    useEffect(() => {
        if (isPlaying) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isPlaying]);

    const unifiedNarrations = useMemo(() => {
        return languages.map(lang => {
            const manual = manualNarrations.find(n => n.language?.code === lang.code);
            if (manual) return { ...manual, isManual: true };
            return {
                language: lang,
                textContent: autoNarrations[lang.code] || '',
                isManual: false
            };
        });
    }, [languages, manualNarrations, autoNarrations]);

    const activeNarration = useMemo(() => {
        return unifiedNarrations.find(n => n.language?.code === activeLangCode) || null;
    }, [unifiedNarrations, activeLangCode]);

    useEffect(() => {
        if (!storeId) return;
        const loadAll = async () => {
            try {
                const userLangCode = selectedLanguage?.code || 'vi';
                const loggedIn = await authHelpers.isLoggedIn();
                const [storeRes, menuRes, narrRes, profileRes] = await Promise.all([
                    storeHelpers.getStoreById(storeId).catch(() => null),
                    storeHelpers.getMenuStores(storeId).catch(() => null),
                    narrationsHelpers.getNarrationsByStoreId(storeId).catch(() => []),
                    loggedIn ? usersHelpers.getProfile().catch(() => null) : Promise.resolve({ isLimitReached: false }),
                ]);


                if (storeRes) setStore(storeRes);
                if (menuRes) setMenus(menuRes.data ?? menuRes ?? []);
                if (profileRes) setIsLimitReached(profileRes.isLimitReached);

                const narrs = (narrRes ?? []) as Narration[];
                setManualNarrations(narrs);

                // Fix: Robust initial language selection
                const foundLangCode =
                    narrs.find(n => n.language?.code === userLangCode)?.language?.code ||
                    languages.find(l => l.code === userLangCode)?.code ||
                    narrs.find(n => n.language?.code === 'vi')?.language?.code ||
                    languages.find(l => l.code === 'vi')?.code ||
                    languages[0]?.code || 'vi';

                setActiveLangCode(foundLangCode);

                if (autoplay) {
                    const pref = narrs.find(n => n.language?.code === foundLangCode);
                    if (pref?.textContent && !profileRes?.isLimitReached) {
                        setTimeout(() => startSpeech(pref), 800);
                    }
                }
            } catch (error) {
                console.warn('[StallDetail] Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAll();
        return () => { Speech.stop(); };
    }, [storeId]);

    const startSpeech = (narration: Narration) => {
        if (!narration?.textContent) return;
        setIsPlaying(true);
        if (narration.id) narrationsHelpers.addListenHistory(narration.id, 'auto').catch(() => { });
        Speech.speak(narration.textContent, {
            language: SPEECH_LANG_MAP[narration.language?.code] ?? 'vi-VN',
            rate: 0.9,
            onDone: () => setIsPlaying(false),
            onError: () => setIsPlaying(false),
        });
    };

    const handleLangSelect = async (lang: Language, autoPlay: boolean = false) => {
        if (!lang) return; // Guard
        if (isTranslating) return;
        Speech.stop();
        setIsPlaying(false);
        setActiveLangCode(lang.code);

        const existingManual = manualNarrations.find(n => n.language?.code === lang.code);
        if (!existingManual && !autoNarrations[lang.code]) {
            const sourceNarration = manualNarrations.find(n => n.language?.code === 'vi') || manualNarrations[0];
            if (sourceNarration?.textContent) {
                setIsTranslating(true);
                try {
                    const translatedData = await languagesHelpers.translateText(sourceNarration.textContent, 'vi', lang.code, storeId);

                    // Re-fetch all narrations from server to ensure perfect sync
                    const freshNarrations = await narrationsHelpers.getNarrationsByStoreId(storeId);
                    setManualNarrations(freshNarrations);


                    if (autoPlay) {
                        // Find the narration we just created in the fresh list
                        const matched = freshNarrations.find((n: Narration) => n.language?.code === lang.code)
                            || { ...translatedData, textContent: translatedData.textContent || translatedData.translatedText };

                        setTimeout(() => {
                            startSpeech(matched);
                        }, 500);
                    }
                } catch (err) {
                    console.error('Translation failed', err);
                    Alert.alert(t('common.error'), t('common.error_msg'));
                } finally {
                    setIsTranslating(false);
                }

            } else {
                if (autoPlay) Alert.alert(t('common.error'), "No source text to translate.");
            }
        }
    };

    const togglePlayback = () => {
        if (isPlaying) {
            Speech.stop();
            setIsPlaying(false);
            return;
        }

        if (isLimitReached) {
            Alert.alert(
                t('map.limit_reached_title'),
                t('map.limit_reached_msg'),
                [{ text: t('common.cancel'), style: 'cancel' }, { text: t('map.view_details'), onPress: () => router.push('/plans' as any) }]
            );
            return;
        }

        if (activeNarration?.textContent) {
            setIsPlaying(true);
            if (activeNarration.id) {
                narrationsHelpers.addListenHistory(activeNarration.id, 'manual').catch(err => {
                    if (err.response?.status === 403) setIsLimitReached(true);
                });
            }
            Speech.speak(activeNarration.textContent, {
                language: SPEECH_LANG_MAP[activeNarration.language?.code] ?? 'vi-VN',
                rate: 0.9,
                onDone: () => setIsPlaying(false),
                onError: () => setIsPlaying(false),
            });
        } else if (activeLangCode) {
            // No text content -> Trigger translation and auto-play
            const lang = languages.find(l => l.code === activeLangCode);
            if (lang) {
                handleLangSelect(lang, true);
            } else {
                // Fallback: If no lang found for active code, try to reset to default
                const defaultLang = languages.find(l => l.code === 'vi') || languages[0];
                if (defaultLang) handleLangSelect(defaultLang, true);
            }
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#009FB7" />
                <Text className="text-[#9CA3AF] mt-4 font-medium">{t('common.loading')}</Text>
            </SafeAreaView>
        );
    }

    if (!store) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
                <Ionicons name="storefront-outline" size={80} color="#F3F4F6" />
                <Text className="text-[#9CA3AF] text-lg mt-4 font-bold">{t('common.error')}</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-[#009FB7] px-8 py-3 rounded-full">
                    <Text className="text-white font-bold">{t('common.back')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* HERO */}
                <View className="relative w-full h-[280px]">
                    {store.coverImage ? (
                        <Image source={{ uri: store.coverImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full bg-[#F3F4F6] items-center justify-center">
                            <Ionicons name="restaurant" size={80} color="#E5E7EB" />
                        </View>
                    )}
                    <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']} className="absolute inset-0" />
                    <View className="absolute top-12 left-5 right-5 flex-row justify-between items-center z-10">
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-black/30 items-center justify-center">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-black/30 items-center justify-center">
                            <Ionicons name="share-social-outline" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View className="absolute bottom-8 left-6 right-6">
                        <View className="bg-[#009FB7] px-3 py-1 rounded-full self-start mb-3">
                            <Text className="text-[10px] font-black text-white uppercase tracking-widest">{store.merchant?.businessName ?? t('home.stalls')}</Text>
                        </View>
                        <Text className="text-3xl font-black text-white leading-tight">{store.name}</Text>
                        <View className="flex-row items-center mt-3">
                            <Ionicons name="location" size={16} color="#009FB7" />
                            <Text className="text-white/90 text-[13px] font-semibold ml-1.5 flex-1" numberOfLines={1}>{store.address}</Text>
                        </View>
                    </View>
                </View>

                {/* CONTENT */}
                <View className="bg-white rounded-t-[35px] -mt-10 pt-8 pb-10">
                    <View className="px-6 gap-8">
                        {/* AUDIO CARD */}
                        <View className="rounded-[30px] bg-[#F8FAFC] p-6 shadow-sm border border-slate-100">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                                {languages.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.id}
                                        onPress={() => handleLangSelect(lang, true)}

                                        className={`flex-row items-center px-4 py-2 rounded-full mr-2.5 ${activeLangCode === lang.code ? 'bg-[#009FB7]' : 'bg-white border border-slate-200'}`}
                                    >
                                        <Text className="text-base mr-1.5">{lang.flagIcon}</Text>
                                        <Text className={`text-xs font-black uppercase tracking-wider ${activeLangCode === lang.code ? 'text-white' : 'text-slate-500'}`}>{lang.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {activeNarration && (
                                <View className="items-center">
                                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                        <View className="w-28 h-28 rounded-full bg-white items-center justify-center border-8 border-teal-50 mb-6">
                                            {isTranslating ? <ActivityIndicator size="large" color="#009FB7" /> : <Ionicons name={isPlaying ? "mic" : "mic-outline"} size={44} color="#009FB7" />}
                                        </View>
                                    </Animated.View>
                                    <Text className="text-slate-800 font-black text-xl text-center mb-1.5">{t('stall.narration')}</Text>
                                    <Text className="text-slate-400 text-[13px] font-medium text-center px-4 leading-5">
                                        {isTranslating ? t('stall.translating') : isPlaying ? `🔊 ${t('map.narrating')}` : t('home.lang_subtext').replace('{lang}', activeNarration.language?.name || '')}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={togglePlayback}
                                        disabled={(isLimitReached || isTranslating) && !isPlaying}
                                        activeOpacity={0.8}
                                        className={`mt-8 w-16 h-16 rounded-full items-center justify-center ${isPlaying ? 'bg-rose-500' : (isLimitReached || isTranslating) ? 'bg-slate-300' : 'bg-[#009FB7]'}`}
                                    >
                                        <Ionicons name={isPlaying ? "square" : "play"} size={28} color="white" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                                    </TouchableOpacity>
                                    {isLimitReached && !isPlaying && (
                                        <TouchableOpacity onPress={() => router.push('/plans' as any)} className="mt-5 flex-row items-center bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
                                            <Ionicons name="lock-closed" size={14} color="#F43F5E" /><Text className="text-rose-500 text-xs font-extrabold ml-1.5 uppercase tracking-wider">{t('map.limit_reached_title')}</Text>
                                        </TouchableOpacity>
                                    )}
                                    {activeNarration.textContent && !isTranslating && (
                                        <View className="mt-8 bg-white/60 p-4 rounded-2xl border border-slate-50 w-full">
                                            <Text className="text-slate-400 text-[13px] text-center italic leading-5" numberOfLines={2}>"{activeNarration.textContent}"</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* ABOUT */}
                        <View className="rounded-[30px] bg-white border border-slate-100 p-6">
                            <View className="flex-row items-center mb-4"><View className="w-1.5 h-6 bg-[#009FB7] rounded-full mr-3" /><Text className="text-slate-800 text-2xl font-black">{t('stall.about')}</Text></View>
                            <Text className="text-slate-500 text-base leading-7 font-medium">{store.description || t('stall.about_fallback')}</Text>
                            {(store.openTime || store.closeTime) && (
                                <View className="mt-8 flex-row items-center p-5 bg-[#F8FAFC] rounded-3xl border border-slate-50">
                                    <View className="w-12 h-12 rounded-2xl bg-[#009FB7] items-center justify-center"><Ionicons name="time" size={24} color="white" /></View>
                                    <View className="ml-4">
                                        <Text className="text-slate-400 font-extrabold text-[12px] uppercase tracking-widest">{t('home.status')}</Text>
                                        <Text className="text-slate-700 font-black text-base mt-0.5">{store.status === 'opening' ? t('home.opening') : t('home.active')} • {store.openTime} - {store.closeTime}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* MENU */}
                        {menus.length > 0 && (
                            <View className="mb-4">
                                <View className="flex-row items-center mb-6 pl-2"><View className="w-1.5 h-6 bg-[#009FB7] rounded-full mr-3" /><Text className="text-slate-800 text-2xl font-black">{t('stall.menu')}</Text></View>
                                {menus.map((item) => (
                                    <View key={item.id} className="flex-row items-center bg-white border border-slate-50 p-4 rounded-3xl mb-4 shadow-sm">
                                        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} className="w-24 h-24 rounded-2xl bg-slate-50" /> : <View className="w-24 h-24 rounded-2xl bg-slate-100 items-center justify-center"><Ionicons name="restaurant" size={32} color="#CBD5E1" /></View>}
                                        <View className="flex-1 ml-4 justify-center">
                                            <Text className="text-slate-800 font-black text-base mb-1.5" numberOfLines={2}>{item.name}</Text>
                                            <Text className="text-[#009FB7] font-black text-lg">{Number(item.price).toLocaleString('vi-VN')}₫</Text>
                                        </View>
                                        <View className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"><Ionicons name="chevron-forward" size={18} color="#94A3B8" /></View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* TRANSLATION MODAL (User Requirement) */}
            <Modal transparent visible={isTranslating} animationType="fade">
                <View className="flex-1 bg-black/50 items-center justify-center px-10">
                    <View className="bg-white rounded-[30px] p-8 w-full items-center shadow-2xl">
                        <ActivityIndicator size="large" color="#009FB7" />
                        <Text className="text-[#1F2937] text-lg font-black mt-6 text-center">{t('stall.translating')}</Text>
                        <Text className="text-[#6B7280] text-sm font-medium mt-2 text-center">{t('stall.translating_sub')}</Text>

                    </View>
                </View>
            </Modal>
        </View>
    );
}
