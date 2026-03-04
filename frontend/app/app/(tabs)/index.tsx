import React from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { styled } from 'nativewind';

// const StyledView = styled(View);
// const Text = styled(Text);

const { width } = Dimensions.get('window');



export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-5"
      >
        {/* --- Header --- */}
        <View className="flex-row justify-between items-center mt-4 mb-6">
          <View className="flex-row items-center">
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
              className="w-12 h-12 rounded-full bg-[#FEF0E6]"
            />
            <View className="ml-3">
              <Text className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase">Good Evening</Text>
              <Text className="text-base font-extrabold text-[#1F2937]">Alex Rivera</Text>
            </View>
          </View>
          <TouchableOpacity className="w-11 h-11 rounded-full bg-[#F3F4F6] items-center justify-center">
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* --- Hero Title --- */}
        <Text className="text-[28px] font-extrabold text-[#1F2937] leading-[34px] mb-6">
          Welcome to Vinh Khanh{"\n"}Food Paradise
        </Text>

        {/* --- Search Bar --- */}
        <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl h-14 px-4 mb-6">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-[#1F2937]"
            placeholder="Search stalls, dishes, or drinks..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* --- Status & Weather Cards --- */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-white border border-[#F3F4F6] rounded-3xl p-4 flex-1 mr-2 shadow-sm shadow-black/5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={16} color="#E86B32" />
              <Text className="text-[11px] font-bold text-[#E86B32] ml-1.5 uppercase tracking-tighter">Status</Text>
            </View>
            <Text className="text-lg font-extrabold text-[#1F2937]">Open Now</Text>
            <Text className="text-xs text-[#9CA3AF]">9:00 AM - 11:00 PM</Text>
          </View>

          <View className="bg-white border border-[#F3F4F6] rounded-3xl p-4 flex-1 ml-2 shadow-sm shadow-black/5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="cloudy-night-outline" size={16} color="#E86B32" />
              <Text className="text-[11px] font-bold text-[#E86B32] ml-1.5 uppercase tracking-tighter">Weather</Text>
            </View>
            <Text className="text-lg font-extrabold text-[#1F2937]">28°C</Text>
            <Text className="text-xs text-[#9CA3AF]">Mostly Cloudy</Text>
          </View>
        </View>

        {/* --- Categories --- */}
        <View className="flex-row justify-between mb-8">
          {[
            { label: 'Seafood', icon: 'fish', color: '#E86B32', bg: '#FFF7ED', type: 'fa' },
            { label: 'Street Food', icon: 'hamburger', color: '#4B5563', bg: '#F3F4F6', type: 'fa' },
            { label: 'Drinks', icon: 'glass-martini-alt', color: '#4B5563', bg: '#F3F4F6', type: 'fa' },
            { label: 'Desserts', icon: 'ice-cream', color: '#4B5563', bg: '#F3F4F6', type: 'fa' },
          ].map((item, index) => (
            <View key={index} className="items-center">
              <View style={{ backgroundColor: item.bg }} className="w-[66px] h-[66px] rounded-2xl items-center justify-center mb-2">
                <FontAwesome5 name={item.icon} size={22} color={item.color} />
              </View>
              <Text className={`text-[12px] font-bold ${index === 0 ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}`}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* --- Audio Tour Banner --- */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop' }}
          className="w-full h-44 rounded-[32px] overflow-hidden mb-10"
        >
          <View className="flex-1 bg-black/40 p-6 justify-center">
            <Text className="text-gray-200 text-xs font-medium mb-1">Immersive Experience</Text>
            <Text className="text-white text-2xl font-extrabold mb-4">Street Food Story</Text>
            <TouchableOpacity className="bg-[#E86B32] flex-row items-center justify-center py-3 px-6 rounded-2xl self-start">
              <Ionicons name="headset-outline" size={20} color="#FFFFFF" />
              <Text className="text-white text-sm font-bold ml-2">Start Audio Tour</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* --- Featured Stalls Header --- */}
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-extrabold text-[#1F2937]">Featured Stalls</Text>
          <TouchableOpacity><Text className="text-sm font-bold text-[#E86B32]">View All</Text></TouchableOpacity>
        </View>

        {/* --- Featured Stalls Horizontal Scroll --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {/* Stall 1 */}
          <View style={{ width: width * 0.68 }} className="bg-white border border-[#F3F4F6] rounded-[28px] mr-4 overflow-hidden shadow-sm">
            <View className="relative">
              <Image source={{ uri: 'https://i.pinimg.com/736x/8f/ba/b6/8fbab6011c778408f65cc9e95fae4680.jpg' }} className="w-full h-36" />
              <View className="absolute top-3 right-3 bg-white/90 flex-row items-center px-2 py-1 rounded-full">
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text className="text-[11px] font-bold text-[#1F2937] ml-1">4.8</Text>
              </View>
            </View>
            <View className="p-4">
              <Text className="text-base font-extrabold text-[#1F2937]">Oc Oanh Seafood</Text>
              <Text className="text-[13px] text-[#9CA3AF] mb-3">Street 4, Sector B</Text>
              <View className="flex-row">
                <View className="bg-[#F3F4F6] px-3 py-1 rounded-lg mr-2"><Text className="text-[11px] font-bold text-[#4B5563]">Spicy Snails</Text></View>
                <View className="bg-[#F3F4F6] px-3 py-1 rounded-lg"><Text className="text-[11px] font-bold text-[#4B5563]">Grilled</Text></View>
              </View>
            </View>
          </View>

          {/* Stall 2 */}
          <View style={{ width: width * 0.68 }} className="bg-white border border-[#F3F4F6] rounded-[28px] mr-4 overflow-hidden shadow-sm">
            <Image source={{ uri: 'https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/09/top-quan-com-tam-quan-1-9.jpg' }} className="w-full h-36" />
            <View className="p-4">
              <Text className="text-base font-extrabold text-[#1F2937]">Banh Khot Ma...</Text>
              <Text className="text-[13px] text-[#9CA3AF] mb-3">Street 2, Entrance</Text>
              <View className="flex-row">
                <View className="bg-[#F3F4F6] px-3 py-1 rounded-lg mr-2"><Text className="text-[11px] font-bold text-[#4B5563]">Pancakes</Text></View>
                <View className="bg-[#F3F4F6] px-3 py-1 rounded-lg"><Text className="text-[11px] font-bold text-[#4B5563]">Crispy</Text></View>
              </View>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}