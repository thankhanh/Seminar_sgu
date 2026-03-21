import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Mock Data for the Cart
const initialCartItems = [
  {
    id: '1',
    name: 'Bánh Tráng Trộn Đặc Biệt',
    price: 25000,
    quantity: 2,
    image: 'https://cdn.tgdd.vn/Files/2019/12/28/1228945/cach-lam-banh-trang-tron-tai-nha-ngon-nhu-ngoai-hang-202112310931165261.jpeg',
    storeName: 'Quầy #15 - Bánh Tráng'
  },
  {
    id: '2',
    name: 'Trà Đào Cam Sả',
    price: 35000,
    quantity: 1,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqLh52R8F87K62C30sBv0n_L28H_kXwF1T9Q&s',
    storeName: 'Quầy #20 - Nước Ép'
  }
];

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(initialCartItems);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
        <Text className="text-lg font-bold text-gray-900">Giỏ hàng của bạn</Text>
        <View className="w-10 h-10" /> {/* Placeholder for balance */}
      </View>

      {/* Cart Items List */}
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {cartItems.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4 text-base">Giỏ hàng đang trống</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/home')}
              className="mt-6 px-6 py-3 bg-[#009FB7] rounded-full"
            >
              <Text className="text-white font-semibold">Khám phá món ngon</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cartItems.map((item) => (
            <View key={item.id} className="flex-row bg-white p-4 rounded-3xl mb-4 shadow-sm shadow-gray-200/50">
              <Image 
                source={{ uri: item.image }} 
                className="w-20 h-20 rounded-2xl bg-gray-100" 
                resizeMode="cover"
              />
              <View className="flex-1 ml-4 justify-between">
                <View>
                  <View className="flex-row justify-between items-start">
                    <Text className="text-base font-bold text-gray-800 flex-1 mr-2" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)} className="p-1">
                      <Ionicons name="close-circle" size={22} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">{item.storeName}</Text>
                </View>
                
                <View className="flex-row justify-between items-center mt-3">
                  <Text className="text-[#009FB7] font-bold text-base">
                    {formatPrice(item.price)}
                  </Text>
                  
                  {/* Quantity Controller */}
                  <View className="flex-row items-center space-x-3 bg-gray-50 rounded-full px-2 py-1">
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                      <Ionicons name="remove" size={16} color="#4B5563" />
                    </TouchableOpacity>
                    
                    <Text className="text-base font-semibold text-gray-800 w-6 text-center">
                      {item.quantity}
                    </Text>
                    
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                      <Ionicons name="add" size={16} color="#009FB7" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-20" /> {/* Bottom padding */}
      </ScrollView>

      {/* Checkout Bottom Bar */}
      {cartItems.length > 0 && (
        <View className="bg-white px-6 py-5 rounded-t-[32px] shadow-lg shadow-black/10 border-t border-gray-100">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-500 text-base">Tổng phụ phí</Text>
            <Text className="text-gray-800 font-semibold">{formatPrice(calculateTotal())}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-gray-900 font-bold text-lg">Thành tiền</Text>
            <Text className="text-[#009FB7] font-bold text-2xl">{formatPrice(calculateTotal())}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/checkout' as any)}
            className="w-full bg-[#009FB7] py-4 rounded-full items-center justify-center shadow-lg shadow-[#009FB7]/30 flex-row"
          >
            <Text className="text-white font-bold text-lg mr-2">Thanh toán ngay</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
