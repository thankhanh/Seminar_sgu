import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Linking, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../constants/api';

const { width } = Dimensions.get('window');

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const planKey = params.planKey as string;
  const price = Number(params.price);
  const planName = params.name as string;

  const handlePayment = async () => {
    if (price === 0) {
      alert('Gói miễn phí không cần thanh toán.');
      return;
    }

    setIsProcessing(true);
    try {
      // Map frontend plan keys to backend SubscriptionTypeEnum
      // Backend expects: USER_MONTHLY, USER_YEARLY, MERCHANT_STARTER, etc.
      let type = '';
      if (planKey.includes('starter')) type = 'merchant_starter';
      else if (planKey.includes('business')) type = 'merchant_business';
      else if (planKey.includes('premium')) type = 'merchant_premium';
      else if (planKey === 'monthly') type = 'user_monthly';
      else if (planKey === 'yearly') type = 'user_yearly';

      const { data: json } = await api.post('/payments/create', {
        method: 'momo',
        type: type,
        amount: price,
        orderInfo: `Nâng cấp gói ${planName}`,
      });

      if (json.success && json.data?.paymentUrl) {
         // Open Momo payment URL
         Linking.openURL(json.data.paymentUrl);
         
         Alert.alert(
           'Đang thanh toán',
           'Vui lòng hoàn tất thanh toán trên ứng dụng MoMo. Sau khi xong, hãy quay lại ứng dụng.',
           [{ text: 'Đã hiểu', onPress: () => router.replace('/(tabs)/home' as any) }]
         );
      } else {
        throw new Error(json.message || 'Không nhận được link thanh toán');
      }
    } catch (error: any) {
      console.warn('Lỗi thanh toán:', error);
      const msg = error.response?.data?.error?.message || error.message || 'Lỗi kết nối';
      alert(`Lỗi: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 flex-1">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-extrabold text-[#1F2937] ml-4">Thanh toán</Text>
        </View>

        {/* Order Summary Card */}
        <View className="bg-[#F9FAFB] rounded-[32px] p-8 mb-8 border border-gray-100">
           <View className="items-center mb-6">
             <View className="w-20 h-20 rounded-full bg-[#009FB7]/10 items-center justify-center mb-4">
                <MaterialCommunityIcons name="wallet-outline" size={40} color="#009FB7" />
             </View>
             <Text className="text-[#9CA3AF] text-sm font-bold uppercase tracking-widest mb-1">Tổng cộng</Text>
             <Text className="text-4xl font-extrabold text-[#1F2937]">{price.toLocaleString('vi-VN')} đ</Text>
           </View>

           <View className="h-[1px] w-full bg-gray-200 mb-6" />

           <View className="space-y-4">
             <View className="flex-row justify-between items-center">
               <Text className="text-[#6B7280] text-sm">Gói đăng ký</Text>
               <Text className="text-[#1F2937] font-bold">{planName}</Text>
             </View>
             <View className="flex-row justify-between items-center">
               <Text className="text-[#6B7280] text-sm">Phương thức</Text>
               <View className="flex-row items-center">
                  <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' }}
                    className="w-5 h-5 mr-2"
                    resizeMode="contain"
                  />
                  <Text className="text-[#1F2937] font-bold">Ví MoMo</Text>
               </View>
             </View>
             <View className="flex-row justify-between items-center">
               <Text className="text-[#6B7280] text-sm">Thời hạn</Text>
               <Text className="text-[#1F2937] font-bold">30 Ngày</Text>
             </View>
           </View>
        </View>

        <Text className="text-[#9CA3AF] text-xs text-center px-8 leading-5 mb-10">
          Bằng việc nhấn "Thanh toán", bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
        </Text>

        <TouchableOpacity 
          onPress={handlePayment}
          disabled={isProcessing}
          className={`w-full h-16 rounded-2xl items-center justify-center flex-row shadow-lg ${isProcessing ? 'bg-gray-400' : 'bg-[#D21469]'}`}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-extrabold text-base mr-2">Thanh toán với MoMo</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
