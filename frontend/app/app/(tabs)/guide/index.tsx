import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import api from '../../../constants/api';

interface Store {
    id: string;
    name: string;
    address: string;
    coverImage?: string;
    _count?: { narrations: number; menus: number };
}

const SPEECH_LANG_MAP: Record<string, string> = {
    vi: 'vi-VN', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', ja: 'ja-JP', fr: 'fr-FR',
};

export default function GuideScreen() {
    const router = useRouter();
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeNarration, setActiveNarration] = useState<any>(null);
    const [activeStoreName, setActiveStoreName] = useState<string>('');
    const [activeStoreImage, setActiveStoreImage] = useState<string>('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLimitReached, setIsLimitReached] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch limit status
                const { data: profile } = await api.get('/users/me');
                if (profile.success) {
                    setIsLimitReached(profile.data.isLimitReached);
                }

                // Fetch stores
                const { data: json } = await api.get('/stores', { params: { status: 'active', limit: 100 } });
                if (json.success && json.data?.data) {
                    const filtered = json.data.data.filter((s: Store) => (s._count?.narrations ?? 0) > 0);
                    setStores(filtered);
                }
            } catch (error) {
                console.warn('Lỗi tải dữ liệu:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const playNarration = async (store: Store) => {
        try {
            if (isPlaying && activeNarration?.storeId === store.id) {
                Speech.stop();
                setIsPlaying(false);
                return;
            }

            // Dừng cái cũ nếu đang chạy
            Speech.stop();
            setIsPlaying(false);

            // Tải thuyết minh của quán
            const res = await api.get(`/stores/${store.id}/narrations`);
            if (!res.data.success || !res.data.data?.length) {
                Alert.alert('Thông báo', 'Quán này hiện chưa có bài thuyết minh.');
                return;
            }

            const narration = res.data.data[0]; // Lấy cái đầu tiên làm mặc định
            setActiveNarration(narration);
            setActiveStoreName(store.name);
            setActiveStoreImage(store.coverImage || '');

            // Ghi nhận lịch sử nghe (kiểm tra giới hạn)
            try {
                await api.post(`/listen/${narration.id}?source=gps`);
            } catch (err: any) {
                if (err.response?.status === 403) {
                    setIsLimitReached(true);
                    Alert.alert(
                        'Giới hạn lượt nghe',
                        err.response?.data?.message || 'Bạn đã hết lượt nghe trong ngày.',
                        [
                            { text: 'Để sau', style: 'cancel' },
                            { text: 'Nâng cấp ngay', onPress: () => router.push('/plans' as any) }
                        ]
                    );
                    return; // Không phát audio nếu bị chặn
                }
            }

            setIsPlaying(true);
            Speech.speak(narration.textContent, {
                language: SPEECH_LANG_MAP[narration.language?.code] ?? 'vi-VN',
                rate: 0.9,
                onDone: () => setIsPlaying(false),
                onError: () => setIsPlaying(false),
            });

        } catch (error) {
            console.warn('Lỗi khi phát thuyết minh:', error);
        }
    };

    const stopNarration = () => {
        Speech.stop();
        setIsPlaying(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F4FBFC]">
            {/* === HEADER === */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3 bg-[#F4FBFC]">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-[#111827]">
                    Vinh Khanh Market
                </Text>
                <TouchableOpacity>
                    <Ionicons name="notifications-outline" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>
            <View className="h-[1px] w-full bg-[#F3F4F6]" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 130 }}
                className="flex-1"
            >
                <View className="px-5 pt-5">
                    {/* === NOW PLAYING WIDGET === */}
                    <View className={`rounded-[24px] p-4 border mb-6 relative shadow-sm ${isPlaying ? 'bg-white border-[#009FB7]' : isLimitReached ? 'bg-gray-100 border-gray-200' : 'bg-[#F4FBFC] border-[#B3EBF2]'}`}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 pr-2">
                                {activeStoreImage ? (
                                    <Image source={{ uri: activeStoreImage }} className="w-[52px] h-[52px] rounded-xl mr-3" />
                                ) : (
                                    <View className="w-[52px] h-[52px] rounded-xl mr-3 bg-gray-200 items-center justify-center">
                                        <Ionicons name="headset" size={24} color="#9CA3AF" />
                                    </View>
                                )}
                                <View className="flex-1">
                                    <Text className={`text-[10px] font-extrabold uppercase tracking-wider mb-0.5 ${isLimitReached && !isPlaying ? 'text-gray-400' : 'text-[#009FB7]'}`}>
                                        {isPlaying ? 'Now Playing' : isLimitReached ? 'Daily Limit Reached' : 'Select a Story'}
                                    </Text>
                                    <Text className={`text-[16px] font-extrabold leading-tight mb-0.5 ${isLimitReached && !isPlaying ? 'text-gray-400' : 'text-[#1F2937]'}`} numberOfLines={1}>
                                        {activeStoreName || 'Guide Tab'}
                                    </Text>
                                    <Text className="text-[12px] text-[#6B7280]">
                                        {isPlaying ? 'Audio Guide Active' : isLimitReached ? 'Please upgrade your plan' : 'Listen to learn more'}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={isPlaying ? stopNarration : undefined}
                                disabled={isLimitReached && !isPlaying}
                                className={`w-[46px] h-[46px] rounded-full items-center justify-center shadow-sm ${isPlaying ? 'bg-red-500 shadow-red-200' : isLimitReached ? 'bg-gray-300' : 'bg-[#009FB7] shadow-[#009FB7]/40'}`}
                            >
                                <Ionicons name={isPlaying ? "stop" : "musical-notes"} size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* === SEARCH BAR === */}
                    <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl h-[50px] px-4 mb-6">
                        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-2 text-base text-[#1F2937]"
                            placeholder="Search stall audio guides"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* === FILTER PILLS === */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="pl-5 mb-8"
                    contentContainerStyle={{ paddingRight: 40 }}
                >
                    <TouchableOpacity className="bg-[#009FB7] px-6 py-2.5 rounded-full mr-3 shadow-sm shadow-[#009FB7]/20">
                        <Text className="text-white text-[13px] font-bold">All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-[#F3F4F6] px-5 py-2.5 rounded-full mr-3">
                        <Text className="text-[#4B5563] text-[13px] font-bold">Recent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-[#F3F4F6] px-5 py-2.5 rounded-full mr-3">
                        <Text className="text-[#4B5563] text-[13px] font-bold">Favorites</Text>
                    </TouchableOpacity>
                </ScrollView>

                <View className="px-5">
                    <Text className="text-[13px] font-extrabold text-[#111827] tracking-wider uppercase mb-5">
                        Market Stories
                    </Text>

                    {isLoading ? (
                        <ActivityIndicator color="#009FB7" size="large" className="mt-10" />
                    ) : (
                        stores.map((item) => (
                            <View key={item.id} className="flex-row items-center justify-between mb-6">
                                <TouchableOpacity 
                                    className="flex-row items-center flex-1 pr-4"
                                    onPress={() => router.push(`/stall/${item.id}` as any)}
                                >
                                    {item.coverImage ? (
                                        <Image
                                            source={{ uri: item.coverImage }}
                                            className="w-[56px] h-[56px] rounded-2xl mr-4 bg-gray-100"
                                        />
                                    ) : (
                                        <View className="w-[56px] h-[56px] rounded-2xl mr-4 bg-[#F3F4F6] items-center justify-center">
                                            <Ionicons name="storefront-outline" size={24} color="#9CA3AF" />
                                        </View>
                                    )}
                                    <View className="flex-1">
                                        <Text className="text-[16px] font-extrabold text-[#111827] mb-0.5 leading-tight">
                                            {item.name}
                                        </Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                                            <Text className="text-[12px] text-[#6B7280] ml-1" numberOfLines={1}>
                                                {item.address}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => playNarration(item)}
                                    disabled={isLimitReached && !(isPlaying && activeNarration?.storeId === item.id)}
                                    className={`px-5 py-2.5 rounded-full ${isPlaying && activeNarration?.storeId === item.id ? 'bg-red-500' : isLimitReached ? 'bg-gray-200' : 'bg-[#F3F4F6]'}`}
                                >
                                    <Text className={`text-[13px] font-bold ${isPlaying && activeNarration?.storeId === item.id ? 'text-white' : isLimitReached ? 'text-gray-400' : 'text-[#009FB7]'}`}>
                                        {isPlaying && activeNarration?.storeId === item.id ? 'Stop' : isLimitReached ? 'Limited' : 'Listen'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
