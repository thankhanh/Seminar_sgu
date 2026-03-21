import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TabItem = ({ icon, label, active = false, isIonicons = true, onPress }: any) => (
  <TouchableOpacity onPress={onPress} className="items-center justify-center flex-1">
    {isIonicons ? (
      <Ionicons name={icon} size={24} color={active ? "#009FB7" : "#9CA3AF"} />
    ) : (
      <MaterialCommunityIcons name={icon} size={24} color={active ? "#009FB7" : "#9CA3AF"} />
    )}
    <Text className={`text-[10px] mt-1 ${active ? "text-[#009FB7] font-bold" : "text-[#9CA3AF]"}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const currentRouteName = state.routes[state.index]?.name || '';

  return (
    <View className="absolute bottom-0 w-full bg-white border-t border-[#B3EBF2] pt-2 pb-8">
      <View className="flex-row justify-around items-center px-4">
        <TabItem
          icon="home"
          label="Home"
          active={currentRouteName.includes('home')}
          onPress={() => router.push('/(tabs)/home')}
        />
        <TabItem
          icon="map-outline"
          label="Map"
          active={currentRouteName.includes('map')}
          onPress={() => router.push('/(tabs)/map')}
        />

        {/* Floating Center QR Scan Button */}
        <View className="-top-10 items-center justify-center">
          <View className="w-[74px] h-[74px] rounded-full bg-white items-center justify-center">
            <TouchableOpacity
              onPress={() => router.push('/scanner' as any)}
              className="w-[58px] h-[58px] rounded-full bg-[#009FB7] items-center justify-center shadow-lg shadow-[#009FB7]/40"
            >
              <Ionicons name="qr-code-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <TabItem
          icon="compass-outline"
          label="Guide"
          active={currentRouteName.includes('guide')}
          onPress={() => router.push('/(tabs)/guide')}
        />
        <TabItem
          icon="person-outline"
          label="Profile"
          active={currentRouteName.includes('profile')}
          onPress={() => router.push('/(tabs)/profile')}
        />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home/index" />
      <Tabs.Screen name="map/index" />
      <Tabs.Screen name="guide/index" />
      <Tabs.Screen name="profile/index" />
      <Tabs.Screen name="explore/index" options={{ href: null }} />

    </Tabs>
  );
}
