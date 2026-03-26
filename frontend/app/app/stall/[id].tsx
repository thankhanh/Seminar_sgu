import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Api';
import { useCart } from '../../context/CartContext';

export default function StallDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const pathName = usePathname();
    const [activeTab, setActiveTab] = useState<'intro' | 'menu' | 'audio'>('intro');
    const [isPlaying, setIsPlaying] = useState(false);
    
    const [store, setStore] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart, totalItems } = useCart();

    const id = params?.id;

    useEffect(() => {
        const fetchStoreDetail = async () => {
            try {
                const res = await fetch(`${API_URL}/stores/${id}`);
                const body = await res.json();
                const storeData = body.data && !Array.isArray(body.data) ? body.data : body;
                setStore(storeData);
            } catch (error) {
                console.error('Error fetching store detail:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchStoreDetail();
    }, [id]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#009FB7" />
            </SafeAreaView>
        );
    }

    if (!store) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text>Store not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-2 bg-[#009FB7] rounded-lg">
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* HERO IMAGE */}
                <View className="relative w-full h-[210px]">
                    <Image source={{ uri: store.coverImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop' }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute inset-0 bg-black/40" />

                    {/* Header Actions */}
                    <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center z-10">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row">
                            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 mr-2">
                                <Ionicons name="share-social-outline" size={22} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 mr-2">
                                <Ionicons name="heart-outline" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => router.push('/cart' as any)}
                                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 relative"
                            >
                                <Ionicons name="cart-outline" size={24} color="white" />
                                {totalItems > 0 && (
                                    <View className="absolute top-0 right-0 h-4 min-w-[16px] bg-red-500 rounded-full border border-white items-center justify-center px-1">
                                        <Text className="text-white text-[9px] font-bold">{totalItems}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Bottom Info inside Hero */}
                    <View className="absolute bottom-4 left-4 right-4">
                        <View className="bg-[#009FB7] px-2 py-1 rounded-md self-start mb-2">
                            <Text className="text-[10px] font-bold text-white uppercase tracking-wider">{store.merchant?.businessName || 'Store'}</Text>
                        </View>
                        <Text className="text-3xl font-extrabold text-white shadow-lg">{store.name}</Text>
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="location-outline" size={14} color="white" />
                            <Text className="text-white text-xs font-medium ml-1 mr-4">{store.address}</Text>
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text className="text-white text-xs font-bold ml-1">4.5</Text>
                            <Text className="text-white/80 text-xs ml-1">(120)</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-white rounded-t-3xl -mt-4 pt-6 px-5 flex flex-col gap-5 min-h-[500px]">
                    {/* TAB CONTENT: AUDIO */}
                    <View className='rounded-xl bg-[#F3F4F6] p-5'>
                        <View className="items-center mt-6">
                            <View className="w-24 h-24 rounded-full bg-[#F4FBFC] items-center justify-center border-4 border-[#B3EBF2] shadow-sm mb-6 relative overflow-hidden">
                                {isPlaying ? <View className="absolute inset-0 bg-[#009FB7] opacity-10" /> : null}
                                <Ionicons name={isPlaying ? "headset" : "headset-outline"} size={40} color="#009FB7" />
                            </View>

                            <Text className="text-[#1F2937] font-bold text-lg text-center mb-1">{store.narrations?.[0]?.language?.name || 'Thuyết minh'}</Text>
                            <Text className="text-[#6B7280] text-[13px]">Tour Ẩm Thực Vĩnh Khánh</Text>

                            <View className="w-full mt-8">
                                {/* Progress Bar */}
                                <View className="w-full h-1.5 bg-gray-200 rounded-full mb-3">
                                    <View className="w-1/3 h-1.5 bg-[#009FB7] rounded-full" />
                                </View>
                                <View className="flex-row justify-between w-full">
                                    <Text className="text-xs text-[#6B7280] font-medium">0:00</Text>
                                    <Text className="text-xs text-[#6B7280] font-medium">
                                        {store.narrations?.[0]?.duration ? Math.floor(store.narrations[0].duration/60) + ':' + (store.narrations[0].duration%60) : '0:00'}
                                    </Text>
                                </View>
                            </View>

                            {/* Controls */}
                            <View className="flex-row items-center justify-center mt-8 w-full gap-8">
                                <TouchableOpacity>
                                    <Ionicons name="play-skip-back" size={32} color="#4B5563" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setIsPlaying(!isPlaying)}
                                    className="w-16 h-16 rounded-full bg-[#009FB7] items-center justify-center shadow-lg"
                                >
                                    <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <Ionicons name="play-skip-forward" size={32} color="#4B5563" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    {/* TAB CONTENT: INTRODUCTION */}
                    <View className='rounded-xl bg-[#F3F4F6] p-5'>
                        <View>
                            <Text className="text-[#009FB7] text-2xl leading-6 font-bold text-center mb-5">
                                Giới thiệu
                            </Text>
                            <Text className="text-[#1F2937] text-base leading-6 font-medium">
                                {store.description || 'Chưa có thông tin giới thiệu.'}
                            </Text>

                            <View className="mt-8 flex-row items-center justify-between p-4 bg-[#F4FBFC] border border-[#B3EBF2] rounded-2xl">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-[#009FB7] items-center justify-center">
                                        <Ionicons name="time-outline" size={20} color="white" />
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-[#1F2937] font-bold text-[13px]">Giờ hoạt động</Text>
                                        <Text className="text-[#4B5563] text-xs mt-0.5">16:00 - 23:30 hằng ngày</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    {/* TAB CONTENT: MENU */}
                    <View className='rounded-xl bg-[#F3F4F6] p-5'>
                        <Text className="text-[#009FB7] text-2xl leading-6 font-bold text-center mb-5">
                            Thực đơn
                        </Text>
                        {store.menus && store.menus.length > 0 ? store.menus.map((item: any) => (
                            <View key={item.id} className="flex-row items-center bg-white border border-gray-100 p-3 rounded-2xl mb-3 shadow-sm">
                                <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} className="w-20 h-20 rounded-xl bg-gray-100" />
                                <View className="flex-1 ml-3 h-20 justify-center">
                                    <Text className="text-[#1F2937] font-bold text-[15px] mb-2">{item.name}</Text>
                                    <Text className="text-[#009FB7] font-extrabold text-[14px]">{item.price}đ</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => {
                                        addToCart(item, store);
                                        Alert.alert('Thành công', `Đã thêm ${item.name} vào giỏ hàng!`);
                                    }}
                                    className="w-8 h-8 rounded-full bg-[#F4FBFC] items-center justify-center"
                                >
                                    <Ionicons name="add" size={20} color="#009FB7" />
                                </TouchableOpacity>
                            </View>
                        )) : (
                            <Text className="text-center text-[#6B7280] italic">Đang cập nhật thực đơn.</Text>
                        )}
                    </View>


                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
