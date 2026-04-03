import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const router = useRouter();
    return (
        <SafeAreaView className="flex-1 bg-[#F4FBFC]">
            {/* === HEADER === */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-4 bg-[#F4FBFC] z-10">
                <TouchableOpacity>
                    <Ionicons name="arrow-back" size={26} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-[#111827]">
                    Profile
                </Text>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>
            <View className="h-[1px] w-full bg-[#F3F4F6]" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 130 }}
                className="flex-1"
            >
                {/* === USER INFO SECTION === */}
                <View className="items-center pt-8 pb-6 border-b border-[#F3F4F6]">
                    {/* Avatar Container */}
                    <View className="relative">
                        <View className="w-[104px] h-[104px] rounded-full bg-[#FFE4D6] items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                            <Image
                                source={{ uri: 'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg' }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                        {/* Edit Badge */}
                        <TouchableOpacity
                            onPress={() => router.push('/profile/edit')}
                            className="absolute bottom-1 right-1 w-7 h-7 bg-[#009FB7] rounded-full items-center justify-center border-2 border-white"
                        >
                            <Feather name="edit-2" size={12} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Name & Title */}
                    <Text className="text-[22px] font-extrabold text-[#111827] mt-4 mb-2">
                        Alex Wanderer
                    </Text>

                    <View className="bg-[#F4FBFC] px-4 py-1.5 rounded-full mb-3">
                        <Text className="text-[#009FB7] font-semibold text-[13px]">
                            Explorer Level: Gold
                        </Text>
                    </View>

                    <Text className="text-[#9CA3AF] text-[13px]">
                        Member since March 2023
                    </Text>

                    {/* --- UPGRADE BANNER --- */}
                    <TouchableOpacity
                        onPress={() => router.push('/plans' as any)}
                        className="w-[90%] bg-[#009FB7] rounded-2xl flex-row items-center p-4 mt-6 shadow-lg shadow-[#009FB7]/30"
                    >
                        <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                            <MaterialCommunityIcons name="crown" size={20} color="white" />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-white font-extrabold text-sm">Nâng cấp Hội viên</Text>
                            <Text className="text-white/80 text-[11px]">Mở khóa tính năng đặc quyền</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="px-5 pt-6">
                    {/* === ACTIVITY & MARKET === */}
                    <Text className="text-[12px] font-extrabold text-[#9CA3AF] tracking-[1.5px] uppercase mb-4">
                        ACTIVITY & MARKET
                    </Text>

                    <TouchableOpacity className="bg-[#F8FAFC] rounded-2xl p-4 flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-[#F4FBFC] rounded-2xl items-center justify-center mr-4">
                                <Feather name="heart" size={20} color="#009FB7" />
                            </View>
                            <View>
                                <Text className="text-[16px] font-bold text-[#1F2937] mb-0.5">My Favorites</Text>
                                <Text className="text-[12px] text-[#9CA3AF]">12 saved food stalls</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-[#F8FAFC] rounded-2xl p-4 flex-row items-center justify-between mb-8"
                        onPress={() => router.push('/profile/visit-history')}
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-[#E2E8F0] rounded-2xl items-center justify-center mr-4">
                                <Feather name="clock" size={20} color="#4B5563" />
                            </View>
                            <View>
                                <Text className="text-[16px] font-bold text-[#1F2937] mb-0.5">Visited Stalls History</Text>
                                <Text className="text-[12px] text-[#9CA3AF]">Vinh Khanh Street history</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* === PREFERENCES === */}
                    <Text className="text-[12px] font-extrabold text-[#9CA3AF] tracking-[1.5px] uppercase mb-4">
                        PREFERENCES
                    </Text>





                    {/* LOG OUT */}
                    <TouchableOpacity
                        className="bg-[#FEF2F2] rounded-2xl p-4 flex-row items-center mb-8"
                        onPress={() => router.replace('/login')}
                    >
                        <View className="w-12 h-12 bg-[#FEE2E2] rounded-2xl items-center justify-center mr-4">
                            <Feather name="log-out" size={20} color="#EF4444" />
                        </View>
                        <Text className="text-[15px] font-bold text-[#EF4444]">Log Out</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
