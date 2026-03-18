import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
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

                    {/* Map / Welcome Card */}
                    <View style={styles.mapCardContainer}>
                        <ImageBackground
                            source={{
                                uri: 'https://img.freepik.com/free-vector/light-blue-city-map-with-red-pins_23-2148325332.jpg',
                            }}
                            style={styles.mapBackground}
                            imageStyle={styles.mapBackgroundImage}
                        >
                            <View style={styles.mapOverlay}>
                                <View style={styles.locationTag}>
                                    <Ionicons name="location-outline" size={16} color="#009FB7" />
                                    <Text style={styles.locationText}>STREET FOOD HUB</Text>
                                </View>
                                <Text style={styles.welcomeText}>Welcome Back</Text>
                                <Text style={styles.welcomeSubtext}>
                                    Discover flavors through our GPS audio guides
                                </Text>
                            </View>
                        </ImageBackground>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Email Field */}
                        <Text style={styles.label}>Email or Phone</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email or phone"
                                placeholderTextColor="#A0A0A0"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password Field */}
                        <View style={styles.passwordHeader}>
                            <Text style={styles.label}>Password</Text>
                            <TouchableOpacity>
                                <Text style={styles.forgotText}>Forgot?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color="#888"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#A0A0A0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                            />
                            <TouchableOpacity
                                onPress={() => setPasswordVisible(!isPasswordVisible)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/(tabs)')}>
                            <Text style={styles.loginButtonText}>Log In</Text>
                            <Ionicons name="arrow-forward-outline" size={20} color="#FFF" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Logins */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Image
                                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png' }}
                                    style={styles.socialIconImage}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Image
                                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png' }}
                                    style={styles.socialIconImage}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up */}
                        <View style={styles.signUpContainer}>
                            <Text style={styles.signUpText}>Don't have an account? </Text>
                            <TouchableOpacity>
                                <Text style={styles.signUpLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer Brand */}
                <View style={styles.footerBrand}>
                    <Ionicons name="restaurant-outline" size={14} color="#C0C0C0" style={{ marginRight: 4 }} />
                    <Text style={styles.footerBrandText}>TASTE THE STREET</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F4FBFC',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F4FBFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    headerBrand: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    mapCardContainer: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 32,
        backgroundColor: '#E5F1F1',
    },
    mapBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    mapBackgroundImage: {
        opacity: 0.6,
    },
    mapOverlay: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 6,
    },
    welcomeSubtext: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        height: 54,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    eyeIcon: {
        padding: 4,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forgotText: {
        fontSize: 14,
        color: '#009FB7',
        fontWeight: '500',
        marginBottom: 8,
    },
    loginButton: {
        backgroundColor: '#009FB7',
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#009FB7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    socialButton: {
        flex: 1,
        height: 54,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 6,
    },
    socialIconImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signUpText: {
        fontSize: 14,
        color: '#6B7280',
    },
    signUpLink: {
        fontSize: 14,
        color: '#009FB7',
        fontWeight: '600',
    },
    footerBrand: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerBrandText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#C0C0C0',
        letterSpacing: 1,
    },
});
