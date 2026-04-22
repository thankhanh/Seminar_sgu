import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../../constants/api';

export default function GuideScreen() {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/narrations/history');
                if (data.success) {
                    setHistory(data.data);
                }
            } catch (error) {
                console.warn('Lỗi tải lịch sử nghe:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const firstItem = history.length > 0 ? history[0] : null;
    return (
        <View className="flex-1 bg-[#F4FBFC]" style={{ paddingTop: insets.top }}>
            {/* === HEADER === */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3 bg-[#F4FBFC]">
                <TouchableOpacity>
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
                    {firstItem ? (
                        <View className="bg-[#F4FBFC] rounded-[24px] p-4 border border-[#B3EBF2] mb-6 relative shadow-sm">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center flex-1 pr-2">
                                    <Image
                                        source={{ uri: firstItem.store?.coverImage || 'https://via.placeholder.com/150' }}
                                        className="w-[52px] h-[52px] rounded-xl mr-3"
                                    />
                                    <View>
                                        <Text className="text-[10px] font-extrabold text-[#009FB7] uppercase tracking-wider mb-0.5">
                                            Nghe gần đây nhất
                                        </Text>
                                        <Text className="text-[16px] font-extrabold text-[#1F2937] leading-tight mb-0.5" numberOfLines={1}>
                                            {firstItem.store?.name || 'Không rõ'}
                                        </Text>
                                        <Text className="text-[12px] text-[#6B7280]">
                                            Đã nghe lúc {new Date(firstItem.listenedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity className="w-[46px] h-[46px] rounded-full bg-[#009FB7] items-center justify-center shadow-sm shadow-[#009FB7]/40">
                                    <View className="flex-row space-x-1">
                                        <View className="w-1.5 h-3.5 bg-white rounded-sm" />
                                        <View className="w-1.5 h-3.5 bg-white rounded-sm ml-1" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Progress Bar */}
                            <View className="w-full h-1 bg-[#B3EBF2] rounded-full overflow-hidden">
                                <View className="w-[40%] h-full bg-[#009FB7] rounded-full" />
                            </View>
                        </View>
                    ) : (
                        <View className="bg-[#F4FBFC] rounded-[24px] p-6 border border-[#B3EBF2] mb-6 items-center">
                            <Text className="text-[#9CA3AF] italic">Chưa có lịch sử nghe gần đây.</Text>
                        </View>
                    )}

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
                    <TouchableOpacity className="bg-[#F3F4F6] px-5 py-2.5 rounded-full mr-3 flex-row items-center">
                        <Text className="text-[#4B5563] text-[13px] font-bold mr-1">Category</Text>
                        <Ionicons name="chevron-down" size={14} color="#4B5563" />
                    </TouchableOpacity>
                </ScrollView>

                <View className="px-5">
                    <Text className="text-[13px] font-extrabold text-[#111827] tracking-wider uppercase mb-5">
                        Market Stories
                    </Text>

                    {/* === STORY ITEMS === */}
                    {isLoading ? (
                        <ActivityIndicator color="#009FB7" style={{ marginTop: 40 }} />
                    ) : history.length === 0 ? (
                        <Text className="text-[#9CA3AF] text-center mt-5">Thử quét mã QR hoặc tìm kiếm ở bản đồ để nghe thuyết minh nhé!</Text>
                    ) : (
                        history.map((item, index) => (
                            <View key={item.id || index} className="flex-row items-center justify-between mb-6">
                                <View className="flex-row items-center flex-1 pr-4">
                                    <Image
                                        source={{ uri: item.store?.coverImage || 'https://via.placeholder.com/150' }}
                                        className="w-[56px] h-[56px] rounded-2xl mr-4 bg-gray-100"
                                    />
                                    <View className="flex-1">
                                        <Text className="text-[16px] font-extrabold text-[#111827] mb-0.5 leading-tight" numberOfLines={1}>
                                            {item.store?.name || 'Không có tên'}
                                        </Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                                            <Text className="text-[12px] text-[#6B7280] ml-1">
                                                {formatDuration(item.narration?.duration)} · Nghe qua {item.source?.toUpperCase() || 'Không rõ'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity className="bg-[#F3F4F6] px-4 py-2.5 rounded-full">
                                    <Text className="text-[#009FB7] text-[13px] font-bold">Nghe lại</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
