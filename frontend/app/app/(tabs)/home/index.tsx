import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Image, ScrollView, TouchableOpacity,
  ImageBackground, Dimensions, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api, { storeHelpers } from '../../../constants/api';
import { useLanguage } from '../../../contexts/LanguageContext';

const { width } = Dimensions.get('window');

interface Store {
  id: string;
  name: string;
  address: string;
  coverImage?: string;
  openTime?: string;
  closeTime?: string;
  _count?: { menus: number; narrations: number };
}

export default function HomeScreen() {
  const router = useRouter();
  const { selectedLanguage, t } = useLanguage();
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showLangModal, setShowLangModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [featuredStoresY, setFeaturedStoresY] = useState(0);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const result = await storeHelpers.getStore();
        if (result && result.data) {
          setFeaturedStores(result.data);
        }
      } catch (e) {
        console.warn('Lỗi tải danh sách quán:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStores();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length > 0 && scrollViewRef.current && featuredStoresY > 0) {
      scrollViewRef.current.scrollTo({ y: featuredStoresY - 20, animated: true });
    }

    try {
      const result = await storeHelpers.getStore(query);
      if (result && result.data) {
        setFeaturedStores(result.data);
      }
    } catch (e) {
      console.warn('Lỗi tải danh sách quán:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4FBFC]">
      <ScrollView
        ref={scrollViewRef}
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
              <Text className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase">{t('home.welcome')}</Text>
              <Text className="text-base font-extrabold text-[#1F2937]">{t('login.brand')}</Text>

            </View>

          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push('/plans' as any)}
              className="w-11 h-11 rounded-full bg-[#009FB7]/10 items-center justify-center mr-3"
            >
              <MaterialCommunityIcons name="crown" size={24} color="#009FB7" />
            </TouchableOpacity>
            <TouchableOpacity className="w-11 h-11 rounded-full bg-[#F3F4F6] items-center justify-center">
              <Ionicons name="notifications-outline" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Hero Title --- */}
        <Text className="text-[28px] font-extrabold text-[#1F2937] leading-[34px] mb-6">
          {t('home.hero_title')}
        </Text>

        {/* --- Search Bar --- */}
        <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl h-14 px-4 mb-8">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-[#1F2937]"
            placeholder={t('home.search_placeholder')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Current Language Info (Optional, but replacing the big selector) */}
        {selectedLanguage && (
          <View className="flex-row items-center mb-8 bg-[#009FB7]/10 px-4 py-3 rounded-2xl">
            <Text className="text-xl mr-3">{selectedLanguage.flagIcon}</Text>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-[#009FB7] uppercase tracking-wider">{t('home.lang_selector')}</Text>
              <Text className="text-xs text-[#1F2937] font-bold">
                {t('home.lang_subtext').replace('{lang}', selectedLanguage.name)}
              </Text>
            </View>
          </View>
        )}


        {/* --- PROMINENT UPGRADE BANNER --- */}
        <TouchableOpacity
          onPress={() => router.push('/plans' as any)}
          className="bg-[#1F2937] rounded-[32px] p-5 mb-8 flex-row items-center border border-[#374151] shadow-xl"
        >
          <View className="w-14 h-14 rounded-2xl bg-[#009FB7] items-center justify-center">
            <MaterialCommunityIcons name="crown" size={32} color="white" />
          </View>
          <View className="ml-4 flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-white text-lg font-extrabold mr-2">{t('home.premium_banner')}</Text>
              <View className="bg-[#009FB7] px-2 py-0.5 rounded-full">
                <Text className="text-white text-[9px] font-bold uppercase">{t('home.new')}</Text>
              </View>

            </View>
            <Text className="text-gray-400 text-xs leading-4">
              {t('home.premium_sub')}
            </Text>
          </View>

          <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>

        {/* --- Status Cards --- */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-white border border-[#F3F4F6] rounded-3xl p-4 flex-1 mr-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={16} color="#009FB7" />
              <Text className="text-[11px] font-bold text-[#009FB7] ml-1.5 uppercase tracking-tighter">{t('home.status')}</Text>
            </View>
            <Text className="text-lg font-extrabold text-[#1F2937]">{t('home.opening')}</Text>
            <Text className="text-xs text-[#9CA3AF]">16:00 - 23:30 {t('common.units.daily')}</Text>

          </View>
          <View className="bg-white border border-[#F3F4F6] rounded-3xl p-4 flex-1 ml-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="storefront-outline" size={16} color="#009FB7" />
              <Text className="text-[11px] font-bold text-[#009FB7] ml-1.5 uppercase tracking-tighter">{t('home.stalls')}</Text>
            </View>
            <Text className="text-lg font-extrabold text-[#1F2937]">{featuredStores.length}+</Text>
            <Text className="text-xs text-[#9CA3AF]">{t('home.active')}</Text>
          </View>
        </View>


        {/* --- Categories --- */}
        {/* <View className="flex-row justify-between mb-8">
          {[
            { label: 'Hải sản', icon: 'fish', color: '#009FB7', bg: '#F4FBFC' },
            { label: 'Ăn vặt', icon: 'hamburger', color: '#4B5563', bg: '#F3F4F6' },
            { label: 'Nước uống', icon: 'glass-martini-alt', color: '#4B5563', bg: '#F3F4F6' },
            { label: 'Tráng miệng', icon: 'ice-cream', color: '#4B5563', bg: '#F3F4F6' },
          ].map((item, index) => (
            <View key={index} className="items-center shadow-sm">
              <View style={{ backgroundColor: item.bg }} className="w-[66px] h-[66px] rounded-2xl items-center justify-center mb-2">
                <FontAwesome5 name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text className={`text-[12px] font-bold ${index === 0 ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}`}>{item.label}</Text>
            </View>
          ))}
        </View> */}

        {/* --- Audio Tour Banner --- */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop' }}
          className="w-full h-44 rounded-[32px] overflow-hidden mb-10"
        >
          <View className="flex-1 bg-black/40 p-6 justify-center">
            <Text className="text-gray-200 text-xs font-medium mb-1">{t('home.audio_sub')}</Text>
            <Text className="text-white text-2xl font-extrabold mb-4">{t('home.audio_story')}</Text>

            <TouchableOpacity onPress={() => router.push('/guide' as any)} className="bg-[#009FB7] flex-row items-center justify-center py-3 px-6 rounded-2xl self-start">
              <Ionicons name="headset-outline" size={20} color="#FFFFFF" />
              <Text className="text-white text-sm font-bold ml-2">{t('home.audio_tour')}</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>


        {/* --- Featured Stalls Header --- */}
        <View
          className="flex-row justify-between items-center mb-5"
          onLayout={(event) => setFeaturedStoresY(event.nativeEvent.layout.y)}
        >
          <Text className="text-xl font-extrabold text-[#1F2937]">{t('home.featured')}</Text>
          <TouchableOpacity><Text className="text-sm font-bold text-[#009FB7]">{t('common.view_all')}</Text></TouchableOpacity>

        </View>


        {/* --- Featured Stalls --- */}
        {isLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#009FB7" />
            <Text className="text-[#9CA3AF] text-sm mt-3">{t('map.loading_stalls')}</Text>
          </View>

        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {featuredStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={{ width: width * 0.68 }}
                className="bg-white border border-[#F3F4F6] rounded-[28px] mr-4 overflow-hidden shadow-sm"
                onPress={() => router.push(`/stall/${store.id}` as any)}
              >
                <View className="relative">
                  {store.coverImage ? (
                    <Image source={{ uri: store.coverImage }} className="w-full h-36" />
                  ) : (
                    <View className="w-full h-36 bg-[#E5E7EB] items-center justify-center">
                      <Ionicons name="storefront-outline" size={40} color="#9CA3AF" />
                    </View>
                  )}
                  {store._count?.narrations ? (
                    <View className="absolute top-3 right-3 bg-[#009FB7]/90 flex-row items-center px-2 py-1 rounded-full">
                      <Ionicons name="headset-outline" size={12} color="white" />
                      <Text className="text-[11px] font-bold text-white ml-1">{store._count.narrations} {t('common.units.narrations')}</Text>
                    </View>

                  ) : null}
                </View>
                <View className="p-4">
                  <Text className="text-base font-extrabold text-[#1F2937]" numberOfLines={1}>{store.name}</Text>
                  <Text className="text-[13px] text-[#9CA3AF] mb-3" numberOfLines={1}>{store.address}</Text>
                  {store._count && (
                    <View className="flex-row">
                      <View className="bg-[#F3F4F6] px-3 py-1 rounded-lg mr-2">
                        <Text className="text-[11px] font-bold text-[#4B5563]">{store._count.menus} {t('common.units.menus')}</Text>
                      </View>

                      {store.openTime && (
                        <View className="bg-[#F3F4F6] px-3 py-1 rounded-lg">
                          <Text className="text-[11px] font-bold text-[#009FB7]">{store.openTime} - {store.closeTime}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}