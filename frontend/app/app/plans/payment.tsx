import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Linking, Dimensions, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import api, { paymentHelpers } from '../../constants/api';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.55;
const POLL_INTERVAL = 3000; // 3 giây
const POLL_TIMEOUT = 10 * 60 * 1000; // 10 phút

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

  // Payment result state
  const [paymentData, setPaymentData] = useState<{
    paymentUrl?: string;
    qrCodeUrl?: string;
    deeplink?: string;
    orderId?: string;
    transactionId?: string;
  } | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const planKey = params.planKey as string;
  const price = Number(params.price);
  const planName = params.name as string;

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const startPolling = (transactionId: string) => {
    setPaymentStatus('pending');

    // Poll every 3 seconds
    pollTimerRef.current = setInterval(async () => {
      try {
        const { data: json } = await paymentHelpers.getPaymentStatus(transactionId);
        const status = json.data?.status || json.status;

        if (status === 'success') {
          stopPolling();
          setPaymentStatus('success');
          // Auto-navigate after showing success briefly
          setTimeout(() => {
            router.replace('/(tabs)/home' as any);
          }, 2000);
        } else if (status === 'failed') {
          stopPolling();
          setPaymentStatus('failed');
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }, POLL_INTERVAL);

    // Timeout after 10 minutes
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      if (paymentStatus === 'pending') {
        setPaymentStatus('failed');
        Alert.alert('Hết thời gian', 'Giao dịch đã hết thời gian chờ. Vui lòng thử lại.');
      }
    }, POLL_TIMEOUT);
  };

  const handlePayment = async () => {
    if (price === 0) {
      alert('Gói miễn phí không cần thanh toán.');
      return;
    }

    setIsProcessing(true);
    try {
      const { data: json } = await paymentHelpers.createPayment('momo', planKey, price, `Nâng cấp gói ${planName}`);

      if (json.success && json.data) {
        const { paymentUrl, qrCodeUrl, deeplink, orderId, transactionId } = json.data;

        if (paymentUrl) {
          setPaymentData({ paymentUrl, qrCodeUrl, deeplink, orderId, transactionId });
          // Start polling for payment status
          if (transactionId) {
            startPolling(transactionId);
          }
        } else {
          throw new Error('Không nhận được link thanh toán từ MoMo');
        }
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

  const handleOpenMoMoApp = async () => {
    if (paymentData?.deeplink) {
      try {
        const canOpen = await Linking.canOpenURL(paymentData.deeplink);
        if (canOpen) {
          Linking.openURL(paymentData.deeplink);
          return;
        }
      } catch (_) { }
    }
    if (paymentData?.paymentUrl) {
      Linking.openURL(paymentData.paymentUrl);
    }
  };

  // ─── Success View ────────────────────────────────────────────
  if (paymentStatus === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-28 h-28 rounded-full bg-[#059669]/10 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={72} color="#059669" />
          </View>
          <Text className="text-3xl font-extrabold text-[#1F2937] mb-2">Thanh toán thành công!</Text>
          <Text className="text-[#6B7280] text-center text-base mb-2">
            Gói <Text className="font-bold text-[#059669]">{planName}</Text> đã được kích hoạt.
          </Text>
          <Text className="text-[#9CA3AF] text-sm">Đang chuyển về trang chủ...</Text>
          <ActivityIndicator color="#059669" className="mt-6" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Failed View ─────────────────────────────────────────────
  if (paymentStatus === 'failed') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-28 h-28 rounded-full bg-[#DC2626]/10 items-center justify-center mb-6">
            <Ionicons name="close-circle" size={72} color="#DC2626" />
          </View>
          <Text className="text-3xl font-extrabold text-[#1F2937] mb-2">Thanh toán thất bại</Text>
          <Text className="text-[#6B7280] text-center text-base mb-8">
            Giao dịch không thành công hoặc đã hết thời gian.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setPaymentData(null);
              setPaymentStatus('idle');
            }}
            className="w-full h-14 rounded-2xl items-center justify-center bg-[#1F2937] mb-3"
          >
            <Text className="text-white font-extrabold text-sm">Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-full h-14 rounded-2xl items-center justify-center bg-gray-100"
          >
            <Text className="text-[#6B7280] font-bold text-sm">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── QR Payment View ─────────────────────────────────────────
  if (paymentData) {
    const qrContent = paymentData.paymentUrl || '';

    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="px-6 pt-4">
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => {
                  stopPolling();
                  setPaymentData(null);
                  setPaymentStatus('idle');
                }}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={20} color="#1F2937" />
              </TouchableOpacity>
              <Text className="text-xl font-extrabold text-[#1F2937] ml-4">Quét mã thanh toán</Text>
            </View>

            {/* QR Code Card */}
            <View className="bg-[#F9FAFB] rounded-[32px] p-8 mb-6 border border-gray-100 items-center">
              {/* MoMo Logo */}
              <View className="flex-row items-center mb-4">
                <Image
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' }}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
                <Text className="text-lg font-extrabold text-[#D21469] ml-2">MoMo</Text>
              </View>

              <Text className="text-[#9CA3AF] text-sm font-bold uppercase tracking-widest mb-5">
                Quét mã QR để thanh toán
              </Text>

              {/* QR Code */}
              <View
                className="bg-white rounded-3xl p-5 mb-5"
                style={{
                  elevation: 6,
                  shadowColor: '#D21469',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                }}
              >
                <QRCode
                  value={qrContent}
                  size={QR_SIZE}
                  color="#1F2937"
                  backgroundColor="#FFFFFF"
                />
              </View>

              {/* Amount */}
              <View className="items-center mt-2">
                <Text className="text-[#9CA3AF] text-xs font-bold uppercase tracking-wider">Số tiền</Text>
                <Text className="text-3xl font-extrabold text-[#1F2937] mt-1">
                  {price.toLocaleString('vi-VN')} đ
                </Text>
              </View>

              {/* Plan info */}
              <View className="mt-4 bg-white rounded-2xl px-6 py-3 border border-gray-100">
                <Text className="text-[#6B7280] text-xs text-center">
                  Gói: <Text className="font-bold text-[#1F2937]">{planName}</Text>
                </Text>
              </View>

              {/* Polling status indicator */}
              {paymentStatus === 'pending' && (
                <View className="flex-row items-center mt-5 bg-[#FEF3C7] rounded-full px-4 py-2">
                  <ActivityIndicator size="small" color="#D97706" />
                  <Text className="text-[#92400E] text-xs font-bold ml-2">
                    Đang chờ xác nhận thanh toán...
                  </Text>
                </View>
              )}
            </View>

            {/* Instructions */}
            <View className="bg-[#FFF7ED] rounded-2xl p-5 mb-6 border border-[#FDBA74]/30">
              <View className="flex-row items-center mb-3">
                <Ionicons name="information-circle" size={20} color="#F97316" />
                <Text className="text-[#9A3412] font-bold ml-2 text-sm">Hướng dẫn thanh toán</Text>
              </View>
              <View className="ml-7 space-y-2">
                <Text className="text-[#9A3412] text-xs leading-5">
                  1. Mở ứng dụng <Text className="font-bold">MoMo</Text> trên điện thoại
                </Text>
                <Text className="text-[#9A3412] text-xs leading-5">
                  2. Chọn <Text className="font-bold">Quét mã QR</Text> và quét mã bên trên
                </Text>
                <Text className="text-[#9A3412] text-xs leading-5">
                  3. Xác nhận thanh toán trên MoMo
                </Text>
                <Text className="text-[#9A3412] text-xs leading-5">
                  4. Ứng dụng sẽ <Text className="font-bold">tự động chuyển</Text> khi thanh toán thành công
                </Text>
              </View>
            </View>

            {/* Action Button - Open MoMo App */}
            <TouchableOpacity
              onPress={handleOpenMoMoApp}
              className="w-full h-14 rounded-2xl items-center justify-center flex-row bg-[#D21469] shadow-lg"
            >
              <Ionicons name="phone-portrait-outline" size={20} color="white" />
              <Text className="text-white font-extrabold text-sm ml-2">
                Mở ứng dụng MoMo
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Initial Payment View ────────────────────────────────────
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
