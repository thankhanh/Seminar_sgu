import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';

export default function CartScreen() {
    const router = useRouter();
    const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();

    return (
        <SafeAreaView className="flex-1 bg-[#F4FBFC]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-4 bg-[#F4FBFC] z-10 border-b border-[#F3F4F6]">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-[#111827]">Giỏ Hàng</Text>
                <TouchableOpacity onPress={clearCart}>
                    <Text className="text-[#EF4444] font-bold text-[14px]">Xóa tất cả</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5 pt-4">
                {items.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
                        <Text className="text-[#6B7280] mt-4 font-bold text-lg">Giỏ hàng của bạn đang trống</Text>
                    </View>
                ) : (
                    items.map(item => (
                        <View key={item.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row">
                            <Image source={{ uri: item.imageUrl }} className="w-20 h-20 rounded-xl bg-gray-100 mr-4" />
                            <View className="flex-1 justify-center">
                                <Text className="font-bold text-[#1F2937] text-[15px] mb-1">{item.name}</Text>
                                <Text className="text-[#6B7280] text-[12px] mb-2">{item.storeName}</Text>
                                <Text className="font-extrabold text-[#009FB7] text-[15px]">{item.price.toLocaleString('vi-VN')}đ</Text>
                            </View>
                            <View className="items-end justify-between">
                                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                    <Feather name="trash-2" size={18} color="#EF4444" />
                                </TouchableOpacity>
                                <View className="flex-row items-center bg-[#F3F4F6] rounded-full px-2 py-1">
                                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} className="w-6 h-6 items-center justify-center">
                                        <Ionicons name="remove" size={16} color="#4B5563" />
                                    </TouchableOpacity>
                                    <Text className="mx-2 font-bold text-[#1F2937]">{item.quantity}</Text>
                                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} className="w-6 h-6 items-center justify-center">
                                        <Ionicons name="add" size={16} color="#4B5563" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {items.length > 0 && (
                <View className="bg-white px-5 py-6 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                    <View className="flex-row justify-between mb-4 items-center">
                        <Text className="text-[#6B7280] font-bold text-base">Tổng phụ:</Text>
                        <Text className="text-[#1F2937] font-extrabold text-xl">{totalAmount.toLocaleString('vi-VN')}đ</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/checkout' as any)}
                        className="bg-[#009FB7] h-14 rounded-2xl items-center justify-center shadow-lg shadow-[#009FB7]/30"
                    >
                        <Text className="text-white font-extrabold text-[16px]">THANH TOÁN ({items.length})</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
