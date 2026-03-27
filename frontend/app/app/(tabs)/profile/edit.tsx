import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../constants/api';

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                if (!token) {
                    router.replace('/(auth)/login');
                    return;
                }
                const res = await fetch(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const body = await res.json();
                if (res.ok) {
                    const userData = body.data || body.user || body;
                    setName(userData.name || '');
                    setPhone(userData.phone || '');
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
            return;
        }
        setIsSaving(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, phone })
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Cập nhật thất bại');

            Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân!');
            router.back();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-[#F4FBFC] items-center justify-center">
                <ActivityIndicator size="large" color="#009FB7" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F4FBFC]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-4 bg-[#F4FBFC] z-10 border-b border-[#F3F4F6]">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={26} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-[#111827]">Sửa hồ sơ</Text>
                <View style={{ width: 26 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-5 pt-6">
                    {/* Name Field */}
                    <Text className="text-[14px] font-bold text-[#374151] mb-2">Họ và Tên</Text>
                    <View className="bg-white border border-[#E5E7EB] rounded-xl h-14 px-4 flex-row items-center mb-6">
                        <Ionicons name="person-outline" size={20} color="#9CA3AF" className="mr-3" />
                        <TextInput
                            className="flex-1 text-[16px] text-[#111827] ml-2"
                            value={name}
                            onChangeText={setName}
                            placeholder="Nhập họ tên của bạn"
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Phone Field */}
                    <Text className="text-[14px] font-bold text-[#374151] mb-2">Số điện thoại</Text>
                    <View className="bg-white border border-[#E5E7EB] rounded-xl h-14 px-4 flex-row items-center mb-6">
                        <Ionicons name="call-outline" size={20} color="#9CA3AF" className="mr-3" />
                        <TextInput
                            className="flex-1 text-[16px] text-[#111827] ml-2"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Nhập số điện thoại"
                            keyboardType="phone-pad"
                        />
                    </View>
                </ScrollView>

                {/* Footer Save Button */}
                <View className="p-5 bg-white border-t border-[#F3F4F6] pb-8">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        className={`h-14 rounded-2xl items-center justify-center flex-row shadow-lg ${isSaving ? 'bg-[#9CA3AF]' : 'bg-[#009FB7] shadow-[#009FB7]/30'}`}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-extrabold text-[16px]">LƯU THAY ĐỔI</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
