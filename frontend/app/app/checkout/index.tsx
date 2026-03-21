import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function CheckoutScreen() {
  const router = useRouter();
  
  // State for selections
  const [deliveryMethod, setDeliveryMethod] = useState<'table' | 'takeaway'>('table');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'momo' | 'vnpay'>('cash');
  
  // Mock Summary
  const subtotal = 60000;
  const platformFee = 2000;
  const total = subtotal + platformFee;

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const PaymentOption = ({ id, title, subtitle, iconImage, iconName }: any) => {
    const isSelected = paymentMethod === id;
    return (
      <TouchableOpacity 
        onPress={() => setPaymentMethod(id)}
        className={`flex-row items-center p-4 rounded-2xl mb-3 border ${
          isSelected ? 'border-[#009FB7] bg-[#F4FBFC]' : 'border-gray-100 bg-white'
        } shadow-sm`}
      >
        <View className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mr-4 border border-gray-100">
            {iconImage ? (
                <Image source={{ uri: iconImage }} className="w-8 h-8 rounded-md" resizeMode="contain" />
            ) : (
                <Ionicons name={iconName} size={28} color="#10B981" />
            )}
        </View>
        <View className="flex-1">
          <Text className={`font-bold text-base ${isSelected ? 'text-[#009FB7]' : 'text-gray-800'}`}>
            {title}
          </Text>
          {subtitle && <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>}
        </View>
        <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${
          isSelected ? 'border-[#009FB7]' : 'border-gray-300'
        }`}>
          {isSelected && <View className="w-3 h-3 rounded-full bg-[#009FB7]" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100 shadow-sm mt-8">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Thanh toán</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        
        {/* Delivery Options */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Thông tin nhận hàng</Text>
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity 
              onPress={() => setDeliveryMethod('table')}
              className={`flex-1 py-3 rounded-xl border ${
                deliveryMethod === 'table' ? 'bg-[#009FB7] border-[#009FB7]' : 'bg-white border-gray-200'
              } items-center`}
            >
              <Text className={`font-bold ${deliveryMethod === 'table' ? 'text-white' : 'text-gray-700'}`}>
                Tại bàn
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setDeliveryMethod('takeaway')}
              className={`flex-1 py-3 rounded-xl border ${
                deliveryMethod === 'takeaway' ? 'bg-[#009FB7] border-[#009FB7]' : 'bg-white border-gray-200'
              } items-center`}
            >
              <Text className={`font-bold ${deliveryMethod === 'takeaway' ? 'text-white' : 'text-gray-700'}`}>
                Mang đi
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic input based on selection */}
          <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <Text className="text-sm font-semibold text-gray-600 mb-2">
              {deliveryMethod === 'table' ? 'Số bàn của bạn' : 'Ghi chú thêm'}
            </Text>
            <TextInput 
              placeholder={deliveryMethod === 'table' ? 'Vd: Bàn số 12 (Quầy Ốc Oanh)' : 'Có yêu cầu gì thêm không...?'}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-base text-gray-800"
            />
          </View>
        </View>

        {/* Payment Methods */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Phương thức thanh toán</Text>
          
          <PaymentOption 
            id="cash" 
            title="Tiền mặt" 
            subtitle="Thanh toán khi nhận đồ ăn"
            iconName="cash"
          />
          
          <PaymentOption 
            id="momo" 
            title="Ví MoMo" 
            subtitle="Thanh toán tiện lợi qua MoMo"
            iconImage="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
          />

          <PaymentOption 
            id="vnpay" 
            title="VNPay" 
            subtitle="Quét mã QR qua ứng dụng ngân hàng"
            iconImage="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
          />
        </View>

        {/* Order Summary */}
        <View className="mb-8 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Chi tiết hóa đơn</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-500 text-base">Tạm tính (2 món)</Text>
            <Text className="text-gray-800 font-semibold">{formatPrice(subtotal)}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-500 text-base">Phí nền tảng</Text>
            <Text className="text-gray-800 font-semibold">{formatPrice(platformFee)}</Text>
          </View>

          <View className="h-[1px] bg-gray-100 w-full mb-4" />

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-900 font-bold text-lg">Tổng cộng</Text>
            <Text className="text-[#009FB7] font-extrabold text-2xl">{formatPrice(total)}</Text>
          </View>
        </View>

        <View className="h-20" /> {/* Bottom padding */}
      </ScrollView>

      {/* Place Order Bottom Bar */}
      <View className="bg-white px-6 py-5 rounded-t-[32px] shadow-lg shadow-black/10 border-t border-gray-100">
        <TouchableOpacity 
          onPress={() => {
              alert('Đặt hàng thành công!');
              router.push('/(tabs)/home');
          }}
          className="w-full bg-[#009FB7] py-4 rounded-full items-center justify-center shadow-lg shadow-[#009FB7]/30 flex-row"
        >
          <Text className="text-white font-bold text-lg mr-2">
            Xác nhận Đặt hàng • {formatPrice(total)}
          </Text>
          <Ionicons name="checkmark-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
