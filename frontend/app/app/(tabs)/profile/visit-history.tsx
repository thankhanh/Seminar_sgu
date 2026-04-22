import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usersHelpers } from '../../../constants/api';

export default function VisitHistoryScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await usersHelpers.getListenHistory();
                setHistory(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            hour: '2-digit', minute: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm shadow-gray-200 flex-row"
            onPress={() => router.push(`/stall/${item.store.id}` as any)}
        >
            <Image
                source={{ uri: item.store.coverImage || 'https://via.placeholder.com/150' }}
                className="w-20 h-20 rounded-xl"
            />
            <View className="ml-4 flex-1 justify-center">
                <Text className="text-[16px] font-bold text-[#1F2937]" numberOfLines={1}>
                    {item.store.name}
                </Text>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text className="text-[12px] text-[#6B7280] ml-1 flex-1" numberOfLines={1}>
                        {item.store.address}
                    </Text>
                </View>
                <View className="flex-row items-center mt-2 justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color="#009FB7" />
                        <Text className="text-[12px] text-[#009FB7] ml-1 font-medium">
                            {formatDate(item.listenedAt)}
                        </Text>
                    </View>
                    <View className="bg-[#F4FBFC] px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] text-[#009FB7] font-bold uppercase">
                            {item.narration?.language?.code || 'VN'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#F4FBFC]">
            {/* HEADER */}
            <View className="flex-row items-center px-4 pt-4 pb-4 bg-[#F4FBFC]">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-[#111827] ml-2">
                    Visited Stalls History
                </Text>
            </View>
            
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#009FB7" />
                </View>
            ) : history.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="headset-outline" size={64} color="#E5E7EB" />
                    <Text className="text-[16px] font-bold text-[#4B5563] mt-4 text-center">
                        No history yet
                    </Text>
                    <Text className="text-[14px] text-[#9CA3AF] mt-2 text-center">
                        Go out and explore the street food market to listen to audio guides!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
