import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../constants/api';

const { width } = Dimensions.get('window');

interface Plan {
  planKey: string;
  name: string;
  description: string;
  price: number;
  maxStore: number;
  maxPOI: number;
  features: string[];
}

export default function PlansScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data: json } = await api.get('/plan-metadata');
        if (json.success) {
          // Process features if they are stored as JSON/string
          const processedPlans = json.data.map((plan: any) => ({
            ...plan,
            features: typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || []),
            price: Number(plan.price)
          }));
          setPlans(processedPlans);
        }
      } catch (error) {
        console.warn('Lỗi tải danh sách gói:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F4FBFC] items-center justify-center">
        <ActivityIndicator size="large" color="#009FB7" />
        <Text className="text-[#9CA3AF] mt-4">Đang tải các gói hội viên...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F4FBFC]">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-sm">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-extrabold text-[#1F2937]">Nâng cấp gói</Text>
          <View className="w-11" />
        </View>

        {/* Hero Section */}
        <View className="items-center mb-10">
          <View className="bg-[#009FB7]/10 px-4 py-1.5 rounded-full mb-3">
            <Text className="text-[#009FB7] text-[11px] font-bold uppercase tracking-widest">Premium Experience</Text>
          </View>
          <Text className="text-3xl font-extrabold text-[#1F2937] text-center mb-3">
             Mở khóa toàn bộ{"\n"}Tính năng đặc quyền
          </Text>
          <Text className="text-[#6B7280] text-center text-sm leading-5 px-6">
            Chọn gói hội viên phù hợp để trải nghiệm audio tour không giới hạn và hỗ trợ gian hàng của bạn.
          </Text>
        </View>

        {/* Plan Cards */}
        {plans.map((plan, index) => (
          <PlanCard 
            key={plan.planKey} 
            plan={plan} 
            isPopular={plan.planKey.includes('business')}
            onSelect={() => router.push({
              pathname: '/plans/payment',
              params: { planKey: plan.planKey, price: plan.price, name: plan.name }
            } as any)}
          />
        ))}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({ plan, isPopular, onSelect }: { plan: Plan, isPopular?: boolean, onSelect: () => void }) {
  return (
    <View 
      className={`bg-white rounded-[32px] p-6 mb-6 border-2 ${isPopular ? 'border-[#009FB7]' : 'border-transparent'} shadow-sm relative overflow-hidden`}
    >
      {isPopular && (
        <View className="absolute top-0 right-0 bg-[#009FB7] px-6 py-2 rounded-bl-3xl">
          <Text className="text-white text-[10px] font-bold uppercase tracking-tighter">Phổ biến nhất</Text>
        </View>
      )}

      <View className="flex-row items-center mb-4">
        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isPopular ? 'bg-[#009FB7]' : 'bg-[#F3F4F6]'}`}>
          <MaterialCommunityIcons 
            name={isPopular ? "rocket-launch" : "star-outline"} 
            size={24} 
            color={isPopular ? "white" : "#009FB7"} 
          />
        </View>
        <View className="ml-4">
          <Text className="text-xl font-extrabold text-[#1F2937]">{plan.name}</Text>
          <Text className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-widest">
            {plan.maxStore} Store | {plan.maxPOI} POI
          </Text>
        </View>
      </View>

      <View className="flex-row items-baseline mb-6">
        <Text className="text-3xl font-extrabold text-[#1F2937]">
          {plan.price === 0 ? 'Miễn phí' : plan.price.toLocaleString('vi-VN') + 'đ'}
        </Text>
        {plan.price > 0 && <Text className="text-[#9CA3AF] text-sm font-bold ml-1">/tháng</Text>}
      </View>

      <View className="space-y-3 mb-8">
        {(plan.features.length > 0 ? plan.features : ['Tính năng cơ bản', 'Nghe thuyết minh GPS']).map((feature, i) => (
          <View key={i} className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={18} color="#009FB7" />
            <Text className="text-[#4B5563] text-sm ml-3 font-medium">{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        onPress={onSelect}
        className={`w-full py-4 rounded-2xl items-center ${isPopular ? 'bg-[#009FB7]' : 'bg-[#1F2937]'}`}
      >
        <Text className="text-white font-extrabold text-[15px]">
          {plan.price === 0 ? 'Bắt đầu ngay' : 'Nâng cấp ngay'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
