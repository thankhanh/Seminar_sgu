import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../context/CartContext';
import { API_URL } from '../../constants/Api';

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, totalAmount, clearCart } = useCart();
    
    const [selectedMethod, setSelectedMethod] = useState<'cash' | 'vnpay' | 'momo'>('cash');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckout = async () => {
        if (items.length === 0) {
            Alert.alert('Lỗi', 'Giỏ hàng đang trống!');
            return;
        }

        setIsProcessing(true);

        try {
            if (selectedMethod === 'cash') {
                // Giả lập xử lý Cash
                setTimeout(() => {
                    Alert.alert('Thành công', 'Đơn hàng của bạn đã được đặt (Thanh toán tiền mặt)!');
                    clearCart();
                    setIsProcessing(false);
                    router.replace('/(tabs)/home');
                }, 1000);
                return;
            }

            // Gọi API thanh toán online
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để thanh toán VNPay/MoMo.');
                router.push('/(auth)/login');
                setIsProcessing(false);
                return;
            }

            const res = await fetch(`${API_URL}/payments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    method: selectedMethod,
                    amount: totalAmount,
                    orderInfo: `Thanh toan giao hang VHK - ${items.length} mon`
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Lỗi tạo thanh toán');
            }

            // data trả về có chứa paymentUrl
            if (data.paymentUrl) {
                // Xóa giỏ hàng trước khi bay ra app
                clearCart();
                // Mở link thanh toán
                await Linking.openURL(data.paymentUrl);
                // Về trang chủ
                router.replace('/(tabs)/home');
            } else {
                throw new Error('Hệ thống không trả về đường dẫn thanh toán.');
            }

        } catch (error: any) {
            console.error(error);
            Alert.alert('Lỗi Thanh Toán', error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F4FBFC]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-4 bg-[#F4FBFC] z-10 border-b border-[#F3F4F6]">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-[#111827]">Thanh Toán</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView className="flex-1 px-5 pt-4">
                <Text className="text-[16px] font-extrabold text-[#1F2937] mb-4">Phương thức thanh toán</Text>

                {/* Tiền mặt */}
                <TouchableOpacity 
                    onPress={() => setSelectedMethod('cash')}
                    className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${selectedMethod === 'cash' ? 'border-[#009FB7] bg-cyan-50' : 'border-[#F3F4F6] bg-white'}`}
                >
                    <View className="w-12 h-12 bg-[#FEF3C7] rounded-full items-center justify-center mr-4">
                        <FontAwesome5 name="wallet" size={20} color="#D97706" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[16px] font-bold text-[#1F2937]">Tiền mặt</Text>
                        <Text className="text-[13px] text-[#6B7280]">Khách thanh toán trực tiếp</Text>
                    </View>
                    <Ionicons name={selectedMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'} size={24} color={selectedMethod === 'cash' ? '#009FB7' : '#9CA3AF'} />
                </TouchableOpacity>

                {/* VNPay */}
                <TouchableOpacity 
                    onPress={() => setSelectedMethod('vnpay')}
                    className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${selectedMethod === 'vnpay' ? 'border-[#009FB7] bg-cyan-50' : 'border-[#F3F4F6] bg-white'}`}
                >
                    <View className="w-12 h-12 bg-[#DBEAFE] rounded-full items-center justify-center mr-4">
                        <FontAwesome5 name="credit-card" size={20} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[16px] font-bold text-[#1F2937]">VNPay</Text>
                        <Text className="text-[13px] text-[#6B7280]">Chuyển khoản Internet Banking</Text>
                    </View>
                    <Ionicons name={selectedMethod === 'vnpay' ? 'radio-button-on' : 'radio-button-off'} size={24} color={selectedMethod === 'vnpay' ? '#009FB7' : '#9CA3AF'} />
                </TouchableOpacity>

                {/* MoMo */}
                <TouchableOpacity 
                    onPress={() => setSelectedMethod('momo')}
                    className={`flex-row items-center p-4 rounded-2xl mb-6 border-2 ${selectedMethod === 'momo' ? 'border-[#009FB7] bg-cyan-50' : 'border-[#F3F4F6] bg-white'}`}
                >
                    <View className="w-12 h-12 bg-[#FCE7F3] rounded-full items-center justify-center mr-4">
                        <FontAwesome5 name="mobile-alt" size={20} color="#DB2777" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[16px] font-bold text-[#1F2937]">Ví MoMo</Text>
                        <Text className="text-[13px] text-[#6B7280]">Ứng dụng thanh toán MoMo</Text>
                    </View>
                    <Ionicons name={selectedMethod === 'momo' ? 'radio-button-on' : 'radio-button-off'} size={24} color={selectedMethod === 'momo' ? '#009FB7' : '#9CA3AF'} />
                </TouchableOpacity>

                <View className="bg-white p-4 rounded-2xl border border-[#F3F4F6] mt-2 mb-10">
                    <Text className="text-[14px] font-bold text-[#1F2937] mb-3">Tóm tắt đơn hàng ({items.length} món)</Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-[#6B7280]">Tạm tính</Text>
                        <Text className="font-bold text-[#1F2937]">{totalAmount.toLocaleString('vi-VN')}đ</Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-[#6B7280]">Phí nền tảng</Text>
                        <Text className="font-bold text-[#1F2937]">0đ</Text>
                    </View>
                    <View className="flex-row justify-between pt-4 border-t border-[#F3F4F6]">
                        <Text className="text-[#1F2937] font-extrabold text-[16px]">TỔNG CỘNG</Text>
                        <Text className="text-[#009FB7] font-extrabold text-[20px]">{totalAmount.toLocaleString('vi-VN')}đ</Text>
                    </View>
                </View>

            </ScrollView>

            <View className="bg-white px-5 py-6 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                <TouchableOpacity 
                    onPress={handleCheckout}
                    disabled={isProcessing}
                    className={`h-14 rounded-2xl items-center justify-center flex-row ${isProcessing ? 'bg-[#9CA3AF]' : 'bg-[#009FB7] shadow-lg shadow-[#009FB7]/30'}`}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-extrabold text-[16px]">XÁC NHẬN MUA ({totalAmount.toLocaleString()}đ)</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
