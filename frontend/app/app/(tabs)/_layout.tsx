import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TabItem = ({ icon, label, active = false, isIonicons = true, onPress }: any) => (
  <TouchableOpacity onPress={onPress} className="items-center justify-center flex-1">
    {isIonicons ? (
      <Ionicons name={icon} size={24} color={active ? "#E86B32" : "#9CA3AF"} />
    ) : (
      <MaterialCommunityIcons name={icon} size={24} color={active ? "#E86B32" : "#9CA3AF"} />
    )}
    <Text className={`text-[10px] mt-1 ${active ? "text-[#E86B32] font-bold" : "text-[#9CA3AF]"}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="absolute bottom-0 w-full bg-white/95 border-t border-[#F3F4F6] pt-2 pb-8">
      <View className="flex-row justify-around items-center px-4">
        <TabItem
          icon="home"
          label="Home"
          active={state.index === 0}
          onPress={() => navigation.navigate('index')}
        />
        <TabItem
          icon="map-outline"
          label="Map"
          active={state.index === 1}
          onPress={() => navigation.navigate('map')}
        />

        {/* Floating Center Audio Button */}
        <View className="-top-10 items-center justify-center">
          <View className="w-[74px] h-[74px] rounded-full bg-[#FEF0E6] items-center justify-center">
            <TouchableOpacity className="w-[58px] h-[58px] rounded-full bg-[#E86B32] items-center justify-center shadow-lg shadow-[#E86B32]/40">
              <Ionicons name="headset" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <TabItem
          icon="compass-outline"
          label="Guide"
          active={state.index === 2}
          onPress={() => navigation.navigate('guide')}
        />
        <TabItem
          icon="person-outline"
          label="Profile"
          active={state.index === 3}
          onPress={() => navigation.navigate('profile')}
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
      <Tabs.Screen name="index" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="guide" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
