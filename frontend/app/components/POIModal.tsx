import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface POIModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  storeName: string;
  storeImage?: string;
  distance?: number;
}

export default function POIModal({
  isVisible,
  onClose,
  onConfirm,
  storeName,
  storeImage,
  distance,
}: POIModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View style={{ width: width * 0.85 }} className="bg-white rounded-[32px] overflow-hidden shadow-2xl">
          {/* Header Image */}
          <View className="relative h-48">
            {storeImage ? (
              <Image source={{ uri: storeImage }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full bg-[#E5F1F1] items-center justify-center">
                <Ionicons name="restaurant-outline" size={60} color="#009FB7" />
              </View>
            )}
            <View className="absolute top-4 right-4">
               <TouchableOpacity 
                 onPress={onClose}
                 className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
               >
                 <Ionicons name="close" size={24} color="white" />
               </TouchableOpacity>
            </View>
            <View className="absolute bottom-4 left-4 bg-[#009FB7] px-3 py-1 rounded-full flex-row items-center">
              <Ionicons name="location" size={12} color="white" />
              <Text className="text-white text-[11px] font-bold ml-1">Gần bạn ({distance ? Math.round(distance * 1000) : '...'}m)</Text>
            </View>
          </View>

          {/* Content */}
          <View className="p-6 items-center">
            <Text className="text-[12px] font-bold text-[#009FB7] tracking-[2px] uppercase mb-2">Phát hiện địa điểm</Text>
            <Text className="text-2xl font-extrabold text-[#1F2937] text-center mb-3">{storeName}</Text>
            <Text className="text-base text-[#6B7280] text-center leading-6 mb-8">
              Bạn đang ở rất gần quán này. Bạn có muốn nghe thuyết minh audio về câu chuyện của quán không?
            </Text>

            {/* Actions */}
            <View className="w-full flex-row space-x-3">
              <TouchableOpacity 
                onPress={onClose}
                className="flex-1 h-14 rounded-2xl border border-[#E5E7EB] items-center justify-center"
              >
                <Text className="text-[#6B7280] font-bold text-base">Bỏ qua</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={onConfirm}
                className="flex-2 h-14 bg-[#009FB7] rounded-2xl items-center justify-center flex-row px-6"
                style={{ flex: 2 }}
              >
                <Ionicons name="headset" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Nghe ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
