import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Api';
import { useCart } from '../../context/CartContext';

export default function StallDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const pathName = usePathname();
    const [activeTab, setActiveTab] = useState<'intro' | 'menu' | 'audio'>('intro');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLangModalVisible, setIsLangModalVisible] = useState(false);

    const [selectedNarrationIndex, setSelectedNarrationIndex] = useState(0);

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

    const currentNarration = store.narrations?.[selectedNarrationIndex];

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
                    {/* CUSTOM TABS */}
                    <View className="flex-row border-b border-gray-100 mb-2">
                        <TouchableOpacity
                            onPress={() => setActiveTab('intro')}
                            className={`flex-1 pb-3 items-center ${activeTab === 'intro' ? 'border-b-2 border-[#009FB7]' : ''}`}
                        >
                            <Text className={`font-bold ${activeTab === 'intro' ? 'text-[#009FB7]' : 'text-gray-400'}`}>Giới thiệu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('menu')}
                            className={`flex-1 pb-3 items-center ${activeTab === 'menu' ? 'border-b-2 border-[#009FB7]' : ''}`}
                        >
                            <Text className={`font-bold ${activeTab === 'menu' ? 'text-[#009FB7]' : 'text-gray-400'}`}>Thực đơn</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('audio')}
                            className={`flex-1 pb-3 items-center ${activeTab === 'audio' ? 'border-b-2 border-[#009FB7]' : ''}`}
                        >
                            <Text className={`font-bold ${activeTab === 'audio' ? 'text-[#009FB7]' : 'text-gray-400'}`}>Thuyết minh</Text>
                        </TouchableOpacity>
                    </View>

                    {/* TAB CONTENT: AUDIO */}
                    {activeTab === 'audio' && (
                        <View className='rounded-xl bg-[#F3F4F6] p-5'>
                            <View className="items-center mt-4">
                                {/* Language Selector */}
                                {store.narrations && store.narrations.length > 0 && (
                                    <TouchableOpacity 
                                        onPress={() => setIsLangModalVisible(true)}
                                        className="flex-row items-center bg-white border border-gray-200 px-4 py-3 rounded-xl mb-6 shadow-sm w-full"
                                    >
                                        <Ionicons name="language" size={20} color="#009FB7" />
                                        <Text className="flex-1 ml-3 text-gray-700 font-bold">
                                            {currentNarration?.language?.name || 'Chọn ngôn ngữ'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}

                                <View className="w-24 h-24 rounded-full bg-[#F4FBFC] items-center justify-center border-4 border-[#B3EBF2] shadow-sm mb-6 relative overflow-hidden">
                                    {isPlaying ? <View className="absolute inset-0 bg-[#009FB7] opacity-10" /> : null}
                                    <Ionicons name={isPlaying ? "headset" : "headset-outline"} size={40} color="#009FB7" />
                                </View>

                                <Text className="text-[#1F2937] font-bold text-lg text-center mb-1">{currentNarration?.language?.name || 'Thuyết minh'}</Text>
                                <Text className="text-[#6B7280] text-[13px]">Tour Ẩm Thực Vĩnh Khánh</Text>

                                <View className="w-full mt-8">
                                    {/* Progress Bar */}
                                    <View className="w-full h-1.5 bg-gray-200 rounded-full mb-3">
                                        <View className="w-1/3 h-1.5 bg-[#009FB7] rounded-full" />
                                    </View>
                                    <View className="flex-row justify-between w-full">
                                        <Text className="text-xs text-[#6B7280] font-medium">0:00</Text>
                                        <Text className="text-xs text-[#6B7280] font-medium">
                                            {currentNarration?.duration ? Math.floor(currentNarration.duration / 60) + ':' + (currentNarration.duration % 60).toString().padStart(2, '0') : '0:00'}
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
                    )}

                    {/* TAB CONTENT: INTRODUCTION */}
                    {activeTab === 'intro' && (
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
                    )}

                    {/* TAB CONTENT: MENU */}
                    {activeTab === 'menu' && (
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
                    )}
                </View>
            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                visible={isLangModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsLangModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <TouchableOpacity 
                        activeOpacity={1} 
                        style={{ flex: 1 }} 
                        onPress={() => setIsLangModalVisible(false)} 
                    />
                    <View className="bg-white rounded-t-3xl p-6 pb-12 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-xl font-extrabold text-[#1F2937]">Chọn ngôn ngữ</Text>
                                <Text className="text-gray-500 text-xs mt-1">Chọn bản thuyết minh bạn muốn nghe</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => setIsLangModalVisible(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <Ionicons name="close" size={20} color="#4B5563" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[400px]">
                            {store.narrations && store.narrations.map((n: any, index: number) => (
                                <TouchableOpacity 
                                    key={index}
                                    onPress={() => {
                                        setSelectedNarrationIndex(index);
                                        setIsLangModalVisible(false);
                                        setIsPlaying(false);
                                    }}
                                    className={`flex-row items-center p-4 rounded-2xl mb-3 border ${selectedNarrationIndex === index ? 'bg-[#F4FBFC] border-[#009FB7]' : 'bg-gray-50 border-transparent'}`}
                                >
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${selectedNarrationIndex === index ? 'bg-[#009FB7]' : 'bg-gray-200'}`}>
                                        <Ionicons 
                                            name="language" 
                                            size={20} 
                                            color={selectedNarrationIndex === index ? 'white' : '#6B7280'} 
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-bold text-[16px] ${selectedNarrationIndex === index ? 'text-[#009FB7]' : 'text-[#1F2937]'}`}>
                                            {n.language?.name}
                                        </Text>
                                        <Text className="text-gray-500 text-xs">
                                            Thời lượng: {n.duration ? Math.floor(n.duration/60) + ':' + (n.duration%60).toString().padStart(2, '0') : '0:00'}
                                        </Text>
                                    </View>
                                    {selectedNarrationIndex === index && (
                                        <View className="w-6 h-6 rounded-full bg-[#009FB7] items-center justify-center">
                                            <Ionicons name="checkmark" size={16} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
