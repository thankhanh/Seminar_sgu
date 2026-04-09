import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import api, { authHelpers, API_URL, usersHelpers } from '../../../constants/api';

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = await authHelpers.getUser();
                if (!user) {
                    router.replace('/(auth)/login');
                    return;
                }
                const profile = await usersHelpers.getProfile();
                if (profile) {
                    setName(profile.name || '');
                    setEmail(profile.email || '');
                    setPhone(profile.phone || '');
                    setAvatar(profile.avatarUrl || null);
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const getFullImageUrl = (path: string | null) => {
        if (!path) return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'User');
        if (path.startsWith('http')) return path;
        return `${API_URL.replace('/api/v1', '')}${path}`;
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setLocalAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
            return;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }
        if (password.trim() && password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (phone.trim() && phone.length < 10) {
            Alert.alert('Lỗi', 'Số điện thoại phải có ít nhất 10 ký tự');
            return;
        }

        setIsSaving(true);
        try {
            let avatarUrl = avatar;

            // 1. Upload ảnh nếu có chọn ảnh mới
            if (localAvatarUri) {
                const formData = new FormData();
                const filename = localAvatarUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                formData.append('file', {
                    uri: localAvatarUri,
                    name: filename,
                    type,
                });

                const uploadRes = await usersHelpers.uploadAvatar(formData);

                if (uploadRes.data.success) {
                    avatarUrl = uploadRes.data.data.url;
                }
            }

            // 2. Cập nhật profile
            const updateData: any = { name, email, phone, avatarUrl };
            if (password.trim()) {
                updateData.password = password;
            }

            await usersHelpers.updateProfile(updateData);

            Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân!');
            router.back();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error.message;
            Alert.alert('Lỗi', msg);
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
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {/* Avatar Selection */}
                    <View className="items-center mt-6 mb-8">
                        <TouchableOpacity onPress={handlePickImage} className="relative">
                            <Image
                                source={{ uri: localAvatarUri || getFullImageUrl(avatar) }}
                                style={{ width: 120, height: 120, borderRadius: 60 }}
                                contentFit="cover"
                            />
                            <View className="absolute bottom-0 right-0 bg-[#009FB7] p-2 rounded-full border-4 border-[#F4FBFC]">
                                <Ionicons name="camera" size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-[#6B7280] text-[13px] mt-3 font-medium">Nhấn để thay đổi ảnh đại diện</Text>
                    </View>

                    {/* Form Fields */}
                    <Text className="text-[14px] font-bold text-[#374151] mb-2">Họ và Tên</Text>
                    <View className="bg-white border border-[#E5E7EB] rounded-xl h-14 px-4 flex-row items-center mb-5">
                        <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 text-[16px] text-[#111827] ml-2"
                            value={name}
                            onChangeText={setName}
                            placeholder="Nhập họ tên"
                            autoCapitalize="words"
                        />
                    </View>

                    <Text className="text-[14px] font-bold text-[#374151] mb-2">Email</Text>
                    <View className="bg-white border border-[#E5E7EB] rounded-xl h-14 px-4 flex-row items-center mb-5">
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 text-[16px] text-[#111827] ml-2"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Nhập địa chỉ email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <Text className="text-[14px] font-bold text-[#374151] mb-2">Số điện thoại</Text>
                    <View className="bg-white border border-[#E5E7EB] rounded-xl h-14 px-4 flex-row items-center mb-5">
                        <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 text-[16px] text-[#111827] ml-2"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Nhập số điện thoại"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <Text className="text-[14px] font-bold text-[#374151] mb-2">Mật khẩu mới</Text>
                    <View className="bg-white border border-[#E5E7EB] rounded-xl h-14 px-4 flex-row items-center mb-5">
                        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 text-[16px] text-[#111827] ml-2"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Để trống nếu không muốn đổi"
                            secureTextEntry
                        />
                    </View>

                    <View style={{ height: 20 }} />
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
