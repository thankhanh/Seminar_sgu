import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Mock data
const mockOrders = [
  {
    id: '#ORD-9821',
    date: '20 Thg 03, 2026 - 19:30',
    status: 'Đang xử lý',
    statusColor: 'text-amber-600',
    statusBg: 'bg-amber-100',
    items: 'Bánh Tráng Trộn Đặc Biệt (x2), Trà Đào Cam Sả (x1)',
    store: 'Quầy #15 & Quầy #20',
    total: 85000
  },
  {
    id: '#ORD-8743',
    date: '15 Thg 03, 2026 - 20:15',
    status: 'Hoàn thành',
    statusColor: 'text-[#10B981]',
    statusBg: 'bg-[#D1FAE5]',
    items: 'Ốc Hương Xào Bơ Tỏi (x1), Càng Ghẹ Rang Muối (x1)',
    store: 'Ốc Oanh Seafood',
    total: 270000
  },
  {
    id: '#ORD-7122',
    date: '10 Thg 03, 2026 - 21:00',
    status: 'Đã hủy',
    statusColor: 'text-red-500',
    statusBg: 'bg-red-100',
    items: 'Chè Khúc Bạch (x2)',
    store: 'Quầy #12 - Chè Ngon',
    total: 70000
  }
];

export default function OrderHistoryScreen() {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
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
        <Text className="text-lg font-bold text-gray-900">Lịch sử mua hàng</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-gray-50">
          <Ionicons name="options-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {mockOrders.map((order, index) => (
          <View key={index} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
            {/* Header: Status and Date */}
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="receipt-outline" size={18} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm font-semibold ml-2">{order.id}</Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${order.statusBg}`}>
                <Text className={`text-xs font-bold uppercase ${order.statusColor}`}>
                  {order.status}
                </Text>
              </View>
            </View>

            <View className="h-[1px] bg-gray-50 w-full mb-3" />

            {/* Store and Items */}
            <View className="mb-4">
              <Text className="text-gray-800 font-extrabold text-base mb-1">{order.store}</Text>
              <Text className="text-gray-500 text-sm leading-5" numberOfLines={2}>
                {order.items}
              </Text>
            </View>

            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-gray-400 text-xs mb-1">Thời gian đặt</Text>
                <Text className="text-gray-700 text-[13px] font-semibold">{order.date}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-400 text-xs mb-1">Tổng tiền</Text>
                <Text className="text-[#009FB7] font-extrabold text-lg">
                  {formatPrice(order.total)}
                </Text>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View className="flex-row mt-5 gap-3">
              <TouchableOpacity className="flex-1 bg-[#F4FBFC] border border-[#B3EBF2] py-2.5 rounded-xl items-center justify-center">
                <Text className="text-[#009FB7] font-bold text-sm">Chi tiết</Text>
              </TouchableOpacity>
              {order.status === 'Hoàn thành' && (
                <TouchableOpacity className="flex-1 bg-[#009FB7] py-2.5 rounded-xl items-center justify-center flex-row">
                  <Feather name="rotate-cw" size={14} color="white" style={{ marginRight: 6 }} />
                  <Text className="text-white font-bold text-sm">Đặt lại</Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        ))}
        
        <View className="h-10" /> {/* Spacer */}
      </ScrollView>

    </SafeAreaView>
  );
}
