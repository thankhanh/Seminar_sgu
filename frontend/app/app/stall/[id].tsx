import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import api from '../../constants/api';

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

    const [store, setStore] = useState<StoreDetail | null>(null);
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [narrations, setNarrations] = useState<Narration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeNarration, setActiveNarration] = useState<Narration | null>(null);

    useEffect(() => {
        if (!storeId) return;
        const loadAll = async () => {
            try {
                const [storeRes, menuRes, narrRes] = await Promise.all([
                    api.get(`/stores/${storeId}`),
                    api.get(`/stores/${storeId}/menus`),
                    api.get(`/stores/${storeId}/narrations`).catch(() => ({ data: { success: false } })),
                ]);
                if (storeRes.data.success) setStore(storeRes.data.data);
                if (menuRes.data.success) setMenus(menuRes.data.data?.data ?? menuRes.data.data ?? []);
                if (narrRes.data.success) {
                    const narrs = narrRes.data.data ?? [];
                    setNarrations(narrs);
                    setActiveNarration(narrs[0] ?? null);
                }
            } catch (error) {
                console.warn('Lỗi tải dữ liệu quán:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAll();
    }, [storeId]);

    const playNarration = () => {
        if (!activeNarration?.textContent) return;
        if (isPlaying) {
            Speech.stop();
            setIsPlaying(false);
            return;
        }
        setIsPlaying(true);
        Speech.speak(activeNarration.textContent, {
            language: SPEECH_LANG_MAP[activeNarration.language?.code] ?? 'vi-VN',
            rate: 0.9,
            onDone: () => setIsPlaying(false),
            onError: () => setIsPlaying(false),
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#009FB7" />
                <Text className="text-[#9CA3AF] mt-4">Đang tải thông tin quán...</Text>
            </SafeAreaView>
        );
    }

    if (!store) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Ionicons name="storefront-outline" size={64} color="#E5E7EB" />
                <Text className="text-[#9CA3AF] text-base mt-4">Không tìm thấy thông tin quán</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-[#009FB7] font-bold">← Quay lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* HERO IMAGE */}
                <View className="relative w-full h-[210px]">
                    {store.coverImage ? (
                        <Image source={{ uri: store.coverImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full bg-[#E5E7EB] items-center justify-center">
                            <Ionicons name="storefront-outline" size={60} color="#9CA3AF" />
                        </View>
                    )}
                    <View className="absolute inset-0 bg-black/40" />
                    {/* Header Actions */}
                    <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center z-10">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30">
                            <Ionicons name="share-social-outline" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                    {/* Bottom Info inside Hero */}
                    <View className="absolute bottom-4 left-4 right-4">
                        <View className="bg-[#009FB7] px-2 py-1 rounded-md self-start mb-2">
                            <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                                {store.merchant?.businessName ?? 'Quán ăn'}
                            </Text>
                        </View>
                        <Text className="text-3xl font-extrabold text-white shadow-lg">{store.name}</Text>
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="location-outline" size={14} color="white" />
                            <Text className="text-white text-xs font-medium ml-1" numberOfLines={1}>{store.address}</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-white rounded-t-3xl -mt-4 pt-6 px-5 gap-5">
                    {/* === AUDIO CARD === */}
                    {activeNarration && (
                        <View className="rounded-xl bg-[#F3F4F6] p-5">
                            {narrations.length > 1 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                    {narrations.map((n) => (
                                        <TouchableOpacity
                                            key={n.id}
                                            onPress={() => { Speech.stop(); setIsPlaying(false); setActiveNarration(n); }}
                                            className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 ${activeNarration.id === n.id ? 'bg-[#009FB7]' : 'bg-white border border-[#E5E7EB]'}`}
                                        >
                                            <Text className="text-sm mr-1">{n.language?.flagIcon}</Text>
                                            <Text className={`text-xs font-bold ${activeNarration.id === n.id ? 'text-white' : 'text-[#4B5563]'}`}>
                                                {n.language?.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                            <View className="items-center">
                                <View className="w-24 h-24 rounded-full bg-[#F4FBFC] items-center justify-center border-4 border-[#B3EBF2] mb-6">
                                    <Ionicons name={isPlaying ? "headset" : "headset-outline"} size={40} color="#009FB7" />
                                </View>
                                <Text className="text-[#1F2937] font-bold text-lg text-center mb-1">
                                    Thuyết minh: {activeNarration.language?.name}
                                </Text>
                                <Text className="text-[#6B7280] text-[13px]">Hướng dẫn âm thanh tự động</Text>
                                <TouchableOpacity
                                    onPress={playNarration}
                                    className={`mt-6 w-16 h-16 rounded-full items-center justify-center shadow-lg ${isPlaying ? 'bg-red-500' : 'bg-[#009FB7]'}`}
                                >
                                    <Ionicons name={isPlaying ? "stop" : "play"} size={32} color="white" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                                </TouchableOpacity>
                                {activeNarration.textContent && (
                                    <Text className="text-[#9CA3AF] text-xs text-center mt-4 px-2" numberOfLines={3}>
                                        {activeNarration.textContent}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* === INTRODUCTION === */}
                    <View className="rounded-xl bg-[#F3F4F6] p-5">
                        <Text className="text-[#009FB7] text-2xl font-bold text-center mb-5">Giới thiệu</Text>
                        <Text className="text-[#1F2937] text-base leading-6 font-medium">
                            {store.description ?? 'Một địa điểm ẩm thực tuyệt vời tại khu phố Vĩnh Khánh.'}
                        </Text>
                        {(store.openTime || store.closeTime) && (
                            <View className="mt-8 flex-row items-center p-4 bg-[#F4FBFC] border border-[#B3EBF2] rounded-2xl">
                                <View className="w-10 h-10 rounded-full bg-[#009FB7] items-center justify-center">
                                    <Ionicons name="time-outline" size={20} color="white" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-[#1F2937] font-bold text-[13px]">Giờ hoạt động</Text>
                                    <Text className="text-[#4B5563] text-xs mt-0.5">
                                        {store.openTime} - {store.closeTime} hằng ngày
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* === MENU === */}
                    {menus.length > 0 && (
                        <View className="rounded-xl bg-[#F3F4F6] p-5 mb-6">
                            <Text className="text-[#009FB7] text-2xl font-bold text-center mb-5">Thực đơn</Text>
                            {menus.map((item) => (
                                <View key={item.id} className="flex-row items-center bg-white border border-gray-100 p-3 rounded-2xl mb-3 shadow-sm">
                                    {item.imageUrl ? (
                                        <Image source={{ uri: item.imageUrl }} className="w-20 h-20 rounded-xl bg-gray-100" />
                                    ) : (
                                        <View className="w-20 h-20 rounded-xl bg-[#E5E7EB] items-center justify-center">
                                            <Ionicons name="restaurant-outline" size={28} color="#9CA3AF" />
                                        </View>
                                    )}
                                    <View className="flex-1 ml-3 justify-center">
                                        <Text className="text-[#1F2937] font-bold text-[15px] mb-2">{item.name}</Text>
                                        <Text className="text-[#009FB7] font-extrabold text-[14px]">
                                            {Number(item.price).toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>

                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
