import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { authHelpers } from '../../constants/api';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
            return;
        }
        setIsLoading(true);
        try {
            await authHelpers.login(email.trim(), password);
            router.replace('/(tabs)/home');
        } catch (error: any) {
            const msg = error?.response?.data?.error?.message ?? 'Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.';
            Alert.alert('Lỗi đăng nhập', msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="compass-outline" size={20} color="#009fb7" />
                            </View>
                            <Text style={styles.headerBrand}>Vinh Khanh Market</Text>
                        </View>
                        <Ionicons name="globe-outline" size={24} color="#888" />
                    </View>

                    {/* Welcome Card */}
                    <View style={styles.mapCardContainer}>
                        <ImageBackground
                            source={{ uri: 'https://img.freepik.com/free-vector/light-blue-city-map-with-red-pins_23-2148325332.jpg' }}
                            style={styles.mapBackground}
                            imageStyle={styles.mapBackgroundImage}
                        >
                            <View style={styles.mapOverlay}>
                                <View style={styles.locationTag}>
                                    <Ionicons name="location-outline" size={16} color="#009FB7" />
                                    <Text style={styles.locationText}>STREET FOOD HUB</Text>
                                </View>
                                <Text style={styles.welcomeText}>Welcome Back</Text>
                                <Text style={styles.welcomeSubtext}>Discover flavors through our GPS audio guides</Text>
                            </View>
                        </ImageBackground>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập email của bạn"
                                placeholderTextColor="#A0A0A0"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.passwordHeader}>
                            <Text style={styles.label}>Mật khẩu</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor="#A0A0A0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                                <Ionicons name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                                    <Ionicons name="arrow-forward-outline" size={20} color="#FFF" style={{ marginLeft: 6 }} />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Guest mode */}
                        <TouchableOpacity style={{ alignItems: 'center', marginTop: 16 }} onPress={() => router.replace('/(tabs)/home')}>
                            <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '500' }}>Tiếp tục không đăng nhập →</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4FBFC' },
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F4FBFC', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    headerBrand: { fontSize: 18, fontWeight: '700', color: '#111827' },
    mapCardContainer: { width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 32, backgroundColor: '#E5F1F1' },
    mapBackground: { width: '100%', height: '100%', justifyContent: 'center' },
    mapBackgroundImage: { opacity: 0.6 },
    mapOverlay: { flex: 1, padding: 20, justifyContent: 'center' },
    locationTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    locationText: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginLeft: 4, letterSpacing: 0.5 },
    welcomeText: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 6 },
    welcomeSubtext: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
    formContainer: { width: '100%' },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, height: 54, paddingHorizontal: 16, marginBottom: 20 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#111827' },
    eyeIcon: { padding: 4 },
    passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    loginButton: { backgroundColor: '#009FB7', height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: '#009FB7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
