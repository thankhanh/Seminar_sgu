import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Animated, Alert, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import api, { narrationsHelpers, storeHelpers, usersHelpers } from '../../constants/api';
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

interface Narration {
    id: string;
    textContent?: string;
    language: { code: string; name: string; flagIcon: string };
}

const SPEECH_LANG_MAP: Record<string, string> = {
    vi: 'vi-VN', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', ja: 'ja-JP', fr: 'fr-FR',
};

export default function StallDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const storeId = params?.id as string;
    const autoplay = params?.autoplay === '1';
    const { selectedLanguage, t } = useLanguage();

    const [store, setStore] = useState<StoreDetail | null>(null);
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [narrations, setNarrations] = useState<Narration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeNarration, setActiveNarration] = useState<Narration | null>(null);
    const [isLimitReached, setIsLimitReached] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pulse animation for active playback
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

    useEffect(() => {
        if (!storeId) return;
        const loadAll = async () => {
            try {
                const userPreferredLang = selectedLanguage?.code || 'vi';

                const [storeRes, menuRes, narrRes, profileRes] = await Promise.all([
                    storeHelpers.getStoreById(storeId).catch(() => null),
                    storeHelpers.getMenuStores(storeId).catch(() => null),
                    narrationsHelpers.getNarrationsByStoreId(storeId).catch(() => null),
                    usersHelpers.getProfile().catch(() => null),
                ]);
                
                if (storeRes) setStore(storeRes);
                if (menuRes) setMenus(menuRes.data ?? menuRes ?? []);
                if (profileRes) setIsLimitReached(profileRes.isLimitReached);
                
                if (narrRes) {
                    const narrs = narrRes ?? [];
                    setNarrations(narrs);

                    // Pick preferred language -> Vietnamese -> fallback to first
                    const preferred: Narration | null =
                        narrs.find((n: Narration) => n.language?.code === userPreferredLang)
                        || narrs.find((n: Narration) => n.language?.code === 'vi')
                        || narrs[0] || null;
                    setActiveNarration(preferred);

                    // Auto-play if requested
                    if (autoplay && preferred?.textContent && !profileRes?.isLimitReached) {
                        setTimeout(() => {
                            startSpeech(preferred);
                        }, 800);
                    }
                }
            } catch (error) {
                console.warn('[StallDetail] Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAll();

        return () => {
            Speech.stop();
        };
    }, [storeId]);

    const startSpeech = (narration: Narration) => {
        if (!narration.textContent) return;
        
        setIsPlaying(true);
        narrationsHelpers.addListenHistory(narration.id, 'auto').catch(() => {});
        
        Speech.speak(narration.textContent, {
            language: SPEECH_LANG_MAP[narration.language?.code] ?? 'vi-VN',
            rate: 0.9,
            onDone: () => setIsPlaying(false),
            onError: () => setIsPlaying(false),
        });
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
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('map.view_details'), onPress: () => router.push('/plans' as any) }
                ]
            );
            return;
        }

        if (activeNarration?.textContent) {
            setIsPlaying(true);
            narrationsHelpers.addListenHistory(activeNarration.id, 'manual').catch(err => {
                if (err.response?.status === 403) setIsLimitReached(true);
            });
            Speech.speak(activeNarration.textContent, {
                language: SPEECH_LANG_MAP[activeNarration.language?.code] ?? 'vi-VN',
                rate: 0.9,
                onDone: () => setIsPlaying(false),
                onError: () => setIsPlaying(false),
            });
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
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="mt-6 bg-[#009FB7] px-8 py-3 rounded-full"
                >
                    <Text className="text-white font-bold">{t('common.back')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* HERO SECTION */}
                <View className="relative w-full h-[280px]">
                    {store.coverImage ? (
                        <Image source={{ uri: store.coverImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full bg-[#F3F4F6] items-center justify-center">
                            <Ionicons name="restaurant" size={80} color="#E5E7EB" />
                        </View>
                    )}
                    
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute inset-0"
                    />

                    {/* Header Actions */}
                    <View className="absolute top-12 left-5 right-5 flex-row justify-between items-center z-10">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-black/30 items-center justify-center">
                            <Ionicons name="share-social-outline" size={22} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Info inside Hero */}
                    <View className="absolute bottom-8 left-6 right-6">
                        <View className="bg-[#009FB7] px-3 py-1 rounded-full self-start mb-3">
                            <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                                {store.merchant?.businessName ?? t('home.stalls')}
                            </Text>
                        </View>
                        <Text className="text-3xl font-black text-white leading-tight">{store.name}</Text>
                        <View className="flex-row items-center mt-3">
                            <Ionicons name="location" size={16} color="#009FB7" />
                            <Text className="text-white/90 text-[13px] font-semibold ml-1.5 flex-1" numberOfLines={1}>{store.address}</Text>
                        </View>
                    </View>
                </View>

                {/* CONTENT SECTION */}
                <View className="bg-white rounded-t-[35px] -mt-10 pt-8 pb-10">
                    <View className="px-6 gap-8">
                        
                        {/* === AUDIO EXPERIENCE CARD === */}
                        {activeNarration && (
                            <View className="rounded-[30px] bg-[#F8FAFC] p-6 shadow-sm border border-slate-100">
                                {narrations.length > 1 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                                        {narrations.map((n) => (
                                            <TouchableOpacity
                                                key={n.id}
                                                onPress={() => { Speech.stop(); setIsPlaying(false); setActiveNarration(n); }}
                                                className={`flex-row items-center px-4 py-2 rounded-full mr-2.5 ${activeNarration.id === n.id ? 'bg-[#009FB7]' : 'bg-white border border-slate-200'}`}
                                            >
                                                <Text className="text-base mr-1.5">{n.language?.flagIcon}</Text>
                                                <Text className={`text-xs font-black uppercase tracking-wider ${activeNarration.id === n.id ? 'text-white' : 'text-slate-500'}`}>
                                                    {n.language?.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                                
                                <View className="items-center">
                                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                        <View className="w-28 h-28 rounded-full bg-white items-center justify-center border-8 border-teal-50 mb-6">
                                            <Ionicons name={isPlaying ? "mic" : "mic-outline"} size={44} color="#009FB7" />
                                        </View>
                                    </Animated.View>
                                    
                                    <Text className="text-slate-800 font-black text-xl text-center mb-1.5">
                                        {t('stall.narration')}
                                    </Text>
                                    <Text className="text-slate-400 text-[13px] font-medium text-center px-4 leading-5">
                                        {isPlaying 
                                            ? `🔊 ${t('map.narrating')}` 
                                            : t('home.lang_subtext').replace('{lang}', activeNarration.language?.name)}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={togglePlayback}
                                        disabled={isLimitReached && !isPlaying}
                                        activeOpacity={0.8}
                                        className={`mt-8 w-16 h-16 rounded-full items-center justify-center ${
                                            isPlaying ? 'bg-rose-500' : isLimitReached ? 'bg-slate-300' : 'bg-[#009FB7]'
                                        }`}
                                    >
                                        <Ionicons name={isPlaying ? "square" : "play"} size={28} color="white" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                                    </TouchableOpacity>

                                    {isLimitReached && !isPlaying && (
                                        <TouchableOpacity
                                            onPress={() => router.push('/plans' as any)}
                                            className="mt-5 flex-row items-center bg-rose-50 px-4 py-2 rounded-full border border-rose-100"
                                        >
                                            <Ionicons name="lock-closed" size={14} color="#F43F5E" />
                                            <Text className="text-rose-500 text-xs font-extrabold ml-1.5 uppercase tracking-wider">{t('map.limit_reached_title')}</Text>
                                        </TouchableOpacity>
                                    )}

                                    {activeNarration.textContent && (
                                        <View className="mt-8 bg-white/60 p-4 rounded-2xl border border-slate-50 w-full">
                                            <Text className="text-slate-400 text-[13px] text-center italic leading-5" numberOfLines={2}>
                                                "{activeNarration.textContent}"
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* === ABOUT SECTION === */}
                        <View className="rounded-[30px] bg-white border border-slate-100 p-6">
                            <View className="flex-row items-center mb-4">
                                <View className="w-1.5 h-6 bg-[#009FB7] rounded-full mr-3" />
                                <Text className="text-slate-800 text-2xl font-black">{t('stall.about')}</Text>
                            </View>
                            
                            <Text className="text-slate-500 text-base leading-7 font-medium">
                                {store.description || t('stall.about_fallback')}
                            </Text>

                            {(store.openTime || store.closeTime) && (
                                <View className="mt-8 flex-row items-center p-5 bg-[#F8FAFC] rounded-3xl border border-slate-50">
                                    <View className="w-12 h-12 rounded-2xl bg-[#009FB7] items-center justify-center">
                                        <Ionicons name="time" size={24} color="white" />
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-slate-400 font-extrabold text-[12px] uppercase tracking-widest">{t('home.status')}</Text>
                                        <Text className="text-slate-700 font-black text-base mt-0.5">
                                            {store.status === 'opening' ? t('home.opening') : t('home.active')} • {store.openTime} - {store.closeTime}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* === MENU SECTION === */}
                        {menus.length > 0 && (
                            <View className="mb-4">
                                <View className="flex-row items-center mb-6 pl-2">
                                    <View className="w-1.5 h-6 bg-[#009FB7] rounded-full mr-3" />
                                    <Text className="text-slate-800 text-2xl font-black">{t('stall.menu')}</Text>
                                </View>

                                {menus.map((item) => (
                                    <View key={item.id} className="flex-row items-center bg-white border border-slate-50 p-4 rounded-3xl mb-4 shadow-sm">
                                        {item.imageUrl ? (
                                            <Image source={{ uri: item.imageUrl }} className="w-24 h-24 rounded-2xl bg-slate-50" />
                                        ) : (
                                            <View className="w-24 h-24 rounded-2xl bg-slate-100 items-center justify-center">
                                                <Ionicons name="restaurant" size={32} color="#CBD5E1" />
                                            </View>
                                        )}
                                        <View className="flex-1 ml-4 justify-center">
                                            <Text className="text-slate-800 font-black text-base mb-1.5" numberOfLines={2}>{item.name}</Text>
                                            <Text className="text-[#009FB7] font-black text-lg">
                                                {Number(item.price).toLocaleString('vi-VN')}₫
                                            </Text>
                                        </View>
                                        <View className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
                                            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
