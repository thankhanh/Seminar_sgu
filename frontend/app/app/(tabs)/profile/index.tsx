import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Api';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleToggleLanguage = async (lang: 'en' | 'vi') => {
        if (user?.preferredLanguage === lang) return;
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ preferredLanguage: lang })
            });
            if (res.ok) {
                const body = await res.json();
                setUser(body.data || body);
            }
        } catch (error) {
            console.error('Failed to change language', error);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('access_token');
        router.replace('/(auth)/login');
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-[#F4FBFC] items-center justify-center">
                <ActivityIndicator size="large" color="#009FB7" />
            </SafeAreaView>
        );
    }

    if (!user) return null;

    return (
        <SafeAreaView className="flex-1 bg-[#F4FBFC]">
            {/* === HEADER === */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-4 bg-[#F4FBFC] z-10">
                <TouchableOpacity onPress={() => router.back()}>
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
                                source={{ uri: user?.avatarUrl || 'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg' }}
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
                    <TouchableOpacity onPress={() => router.push('/profile/edit')}>
                        <Text className="text-[22px] font-extrabold text-[#111827] mt-4 mb-2">
                            {user?.name || 'User'}
                        </Text>
                    </TouchableOpacity>

                    <View className="bg-[#F4FBFC] px-4 py-1.5 rounded-full mb-3">
                        <Text className="text-[#009FB7] font-semibold text-[13px]">
                            {user?.role === 'admin' ? 'Administrator' : user?.role === 'merchant' ? 'Store Owner' : 'Explorer Level: Gold'}
                        </Text>
                    </View>

                    <Text className="text-[#9CA3AF] text-[13px]">
                        {user?.email}
                    </Text>
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

                    <TouchableOpacity className="bg-[#F8FAFC] rounded-2xl p-4 flex-row items-center justify-between mb-3">
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

                    <TouchableOpacity
                        onPress={() => router.push('/orders' as any)}
                        className="bg-[#F8FAFC] rounded-2xl p-4 flex-row items-center justify-between mb-8"
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-[#FEF3C7] rounded-2xl items-center justify-center mr-4">
                                <Ionicons name="receipt-outline" size={20} color="#D97706" />
                            </View>
                            <View>
                                <Text className="text-[16px] font-bold text-[#1F2937] mb-0.5">Order History</Text>
                                <Text className="text-[12px] text-[#9CA3AF]">Track your recent orders</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* === PREFERENCES === */}
                    <Text className="text-[12px] font-extrabold text-[#9CA3AF] tracking-[1.5px] uppercase mb-4">
                        PREFERENCES
                    </Text>

                    <View className="bg-[#F8FAFC] rounded-2xl p-4 flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-[#E2E8F0] rounded-2xl items-center justify-center mr-4">
                                <Ionicons name="language" size={20} color="#4B5563" />
                            </View>
                            <Text className="text-[16px] font-bold text-[#1F2937]">Audio Language</Text>
                        </View>

                        {/* EN/VN Toggle */}
                        <View className="flex-row bg-[#E2E8F0] rounded-lg p-1">
                            <TouchableOpacity
                                onPress={() => handleToggleLanguage('en')}
                                className={`${user?.preferredLanguage !== 'vi' ? 'bg-white shadow-sm' : ''} px-3 py-1.5 rounded`}
                            >
                                <Text className={`text-[12px] ${user?.preferredLanguage !== 'vi' ? 'font-extrabold text-[#111827]' : 'font-bold text-[#6B7280]'}`}>EN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleToggleLanguage('vi')}
                                className={`${user?.preferredLanguage === 'vi' ? 'bg-white shadow-sm' : ''} px-3 py-1.5 rounded`}
                            >
                                <Text className={`text-[12px] ${user?.preferredLanguage === 'vi' ? 'font-extrabold text-[#111827]' : 'font-bold text-[#6B7280]'}`}>VN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity className="bg-[#F8FAFC] rounded-2xl p-4 flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-[#E2E8F0] rounded-2xl items-center justify-center mr-4">
                                <Feather name="sliders" size={20} color="#4B5563" />
                            </View>
                            <Text className="text-[16px] font-bold text-[#1F2937]">App Settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* LOG OUT */}
                    <TouchableOpacity
                        className="bg-[#FEF2F2] rounded-2xl p-4 flex-row items-center mb-8"
                        onPress={handleLogout}
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
