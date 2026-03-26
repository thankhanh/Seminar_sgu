import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { API_URL } from '../../../constants/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import { styled } from 'nativewind';

// const StyledView = styled(View);
// const Text = styled(Text);

const { width } = Dimensions.get('window');



export default function HomeScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }
      const res = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to fetch profile');
      setUser(body.data || body.user || body);
    } catch (error) {
      console.error(error);
      Alert.alert('Session Expired', 'Please log in again.');
      AsyncStorage.removeItem('access_token');
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch(`${API_URL}/stores?limit=5`);
        const body = await res.json();
        // Backend returns { success, data: { data: [...], total: ... } }
        let list = [];
        if (Array.isArray(body)) {
          list = body;
        } else if (body && body.data) {
          if (Array.isArray(body.data)) {
            list = body.data;
          } else if (Array.isArray(body.data.data)) {
            list = body.data.data;
          }
        }
        setStores(list);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStores();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F4FBFC]">
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
              className="w-12 h-12 rounded-full bg-[#F4FBFC]"
            />
            <View className="ml-3">
              <Text className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase">Good Evening</Text>
              <Text className="text-base font-extrabold text-[#1F2937]">{user?.name}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="w-11 h-11 rounded-full bg-[#F3F4F6] items-center justify-center">
              <Ionicons name="notifications-outline" size={24} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/cart' as any)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 relative"
            >
              <Ionicons name="cart-outline" size={24} color="" />
              <View className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border border-white" />
            </TouchableOpacity>
          </View>

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
              <Ionicons name="time-outline" size={16} color="#009FB7" />
              <Text className="text-[11px] font-bold text-[#009FB7] ml-1.5 uppercase tracking-tighter">Status</Text>
            </View>
            <Text className="text-lg font-extrabold text-[#1F2937]">Open Now</Text>
            <Text className="text-xs text-[#9CA3AF]">9:00 AM - 11:00 PM</Text>
          </View>

          <View className="bg-white border border-[#F3F4F6] rounded-3xl p-4 flex-1 ml-2 shadow-sm shadow-black/5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="cloudy-night-outline" size={16} color="#009FB7" />
              <Text className="text-[11px] font-bold text-[#009FB7] ml-1.5 uppercase tracking-tighter">Weather</Text>
            </View>
            <Text className="text-lg font-extrabold text-[#1F2937]">28°C</Text>
            <Text className="text-xs text-[#9CA3AF]">Mostly Cloudy</Text>
          </View>
        </View>

        {/* --- Categories --- */}
        <View className="flex-row justify-between mb-8">
          {[
            { label: 'Seafood', icon: 'fish', color: '#009FB7', bg: '#F4FBFC', type: 'fa' },
            { label: 'Street Food', icon: 'hamburger', color: '#4B5563', bg: '#F3F4F6', type: 'fa' },
            { label: 'Drinks', icon: 'glass-martini-alt', color: '#4B5563', bg: '#F3F4F6', type: 'fa' },
            { label: 'Desserts', icon: 'ice-cream', color: '#4B5563', bg: '#F3F4F6', type: 'fa' },
          ].map((item, index) => (
            <View key={index} className="items-center shadow-sm shadow-black/5">
              <View style={{ backgroundColor: item.bg }} className="w-[66px] h-[66px] rounded-2xl items-center justify-center mb-2">
                <FontAwesome5 name={item.icon as any} size={22} color={item.color} />
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
            <TouchableOpacity className="bg-[#009FB7] flex-row items-center justify-center py-3 px-6 rounded-2xl self-start">
              <Ionicons name="headset-outline" size={20} color="#FFFFFF" />
              <Text className="text-white text-sm font-bold ml-2">Start Audio Tour</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* --- Featured Stalls Header --- */}
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-extrabold text-[#1F2937]">Featured Stalls</Text>
          <TouchableOpacity><Text className="text-sm font-bold text-[#009FB7]">View All</Text></TouchableOpacity>
        </View>

        {/* --- Featured Stalls Horizontal Scroll --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {isLoading ? (
            <View style={{ width }} className="py-10 flex items-center justify-center">
              <ActivityIndicator size="large" color="#009FB7" />
            </View>
          ) : stores.length === 0 ? (
            <View style={{ width }} className="py-10 flex items-center justify-center">
              <Text className="text-[#9CA3AF] text-sm font-medium">No featured stalls available right now.</Text>
            </View>
          ) : (
            stores.map((store, index) => (
              <View key={store.id || index} style={{ width: width * 0.68 }} className="bg-white border border-[#F3F4F6] rounded-[28px] mr-4 overflow-hidden shadow-sm">
                <View className="relative">
                  <Image source={{ uri: store.coverImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop' }} className="w-full h-36" />
                  <View className="absolute top-3 right-3 bg-white/90 flex-row items-center px-2 py-1 rounded-full">
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text className="text-[11px] font-bold text-[#1F2937] ml-1">{store.rating || '4.5'}</Text>
                  </View>
                </View>
                <View className="p-4">
                  <Text className="text-base font-extrabold text-[#1F2937]" numberOfLines={1}>
                    {store.name || 'Unnamed Store'}
                  </Text>
                  <Text className="text-[13px] text-[#9CA3AF] mb-3" numberOfLines={1}>
                    {store.address || store.description || 'Street Food District'}
                  </Text>
                  <View className="flex-row overflow-hidden">
                    <View className="bg-[#F3F4F6] px-3 py-1 rounded-lg mr-2"><Text className="text-[11px] font-bold text-[#4B5563]">Featured</Text></View>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}