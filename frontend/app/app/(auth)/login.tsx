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
    Alert,
    ActivityIndicator,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { authHelpers } from '../../constants/api';
import { API_URL } from '../../constants/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LoginScreen() {
    const router = useRouter();
    const { t, languages, selectedLanguage, setSelectedLanguage } = useLanguage();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLangModal, setShowLangModal] = useState(false);

    const handleAuth = async () => {
        if (isLogin) {
            handleLogin();
        } else {
            handleSignUp();
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('common.error'), t('login.enter_email_password', 'Please enter email and password.'));
            return;
        }
        setIsLoading(true);
        try {
            await authHelpers.login(email.trim(), password);
            Alert.alert(t('common.success'), t('login.login_success', 'Logged in successfully!'));
            router.replace('/(tabs)/home');
        } catch (error: any) {
            Alert.alert(t('login.login_error', 'Login Error'), error.message);
        } finally {
            setIsLoading(false);
        }
    };


    const handleSignUp = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert(t('common.error'), t('login.fill_all', 'Please fill in all fields.'));
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert(t('common.error'), t('login.password_mismatch', 'Passwords do not match.'));
            return;
        }
        setIsLoading(true);
        try {
            await authHelpers.register(name.trim(), email.trim(), password);
            Alert.alert(t('common.success'), t('login.signup_success', 'Account created successfully!'));
            router.replace('/(tabs)/home');
        } catch (error: any) {
            Alert.alert(t('login.signup_error', 'Sign Up Error'), error.message);
        } finally {
            setIsLoading(false);
        }
    };


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
                            <Text style={styles.headerBrand}>{t('login.brand')}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowLangModal(true)} style={styles.langButton}>
                            <Text style={styles.langTagText}>{selectedLanguage?.flagIcon}</Text>
                            <Ionicons name="globe-outline" size={24} color="#009FB7" />
                        </TouchableOpacity>
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
                                <Text style={styles.welcomeText}>{isLogin ? t('login.welcome_back') : t('login.create_account')}</Text>
                                <Text style={styles.welcomeSubtext}>
                                    {isLogin ? t('login.subtext_login') : t('login.subtext_signup')}
                                </Text>

                            </View>
                        </ImageBackground>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Name Field (Sign Up Only) */}
                        {!isLogin && (
                            <>
                                <Text style={styles.label}>{t('login.full_name')}</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('login.enter_name')}
                                        placeholderTextColor="#A0A0A0"
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </>
                        )}

                        {/* Email Field */}
                        <Text style={styles.label}>{t('login.email_phone')}</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('login.enter_email')}
                                placeholderTextColor="#A0A0A0"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>


                        {/* Password Field */}
                        <View style={styles.passwordHeader}>
                            <Text style={styles.label}>{t('login.password')}</Text>
                            {isLogin && (
                                <TouchableOpacity>
                                    <Text style={styles.forgotText}>{t('login.forgot')}</Text>
                                </TouchableOpacity>
                            )}
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
                                placeholder={t('login.enter_password')}
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

                        {/* Confirm Password Field (Sign Up Only) */}
                        {!isLogin && (
                            <>
                                <Text style={styles.label}>{t('login.confirm_password')}</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={20}
                                        color="#888"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t('login.confirm_password')}
                                        placeholderTextColor="#A0A0A0"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!isConfirmPasswordVisible}
                                    />

                                    <TouchableOpacity
                                        onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={isConfirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                                            size={20}
                                            color="#888"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* Login / Sign Up Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
                            onPress={handleAuth}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>{isLogin ? t('login.log_in') : t('login.sign_up')}</Text>
                                    <Ionicons name={isLogin ? "arrow-forward-outline" : "person-add-outline"} size={20} color="#FFF" style={{ marginLeft: 6 }} />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>{t('login.or_continue')}</Text>
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

                        {/* Sign Up / Log In Toggle */}
                        <View style={styles.signUpContainer}>
                            <Text style={styles.signUpText}>
                                {isLogin ? t('login.no_account') : t('login.have_account')}
                            </Text>
                            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                                <Text style={styles.signUpLink}>{isLogin ? t('login.sign_up') : t('login.log_in')}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>

                {/* Footer Brand */}
                <View style={styles.footerBrand}>
                    <Ionicons name="restaurant-outline" size={14} color="#C0C0C0" style={{ marginRight: 4 }} />
                    <Text style={styles.footerBrandText}>{t('login.footer')}</Text>
                </View>

                {/* --- LANGUAGE MODAL --- */}
                <Modal visible={showLangModal} transparent animationType="fade" onRequestClose={() => setShowLangModal(false)}>
                    <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowLangModal(false)}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTitle}>{t('login.select_language')}</Text>
                            {languages.map((lang) => {
                                const isActive = selectedLanguage?.code === lang.code;
                                return (
                                    <TouchableOpacity
                                        key={lang.code}
                                        onPress={() => { setSelectedLanguage(lang); setShowLangModal(false); }}
                                        style={[styles.langOption, isActive && styles.langOptionActive]}
                                    >
                                        <Text style={styles.langFlag}>{lang.flagIcon}</Text>
                                        <Text style={[styles.langName, isActive && styles.langNameActive]}>{lang.name}</Text>
                                        {isActive && <Ionicons name="checkmark-circle" size={22} color="#009FB7" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Modal>
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
    langButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    langTagText: {
        fontSize: 16,
        marginRight: 6,
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
    // Modal Styles
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    modalHandle: {
        width: 48,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#E5E7EB',
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 20,
    },
    langOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
    },
    langOptionActive: {
        backgroundColor: '#E6F6F8',
        borderWidth: 1,
        borderColor: '#009FB7',
    },
    langFlag: {
        fontSize: 24,
        marginRight: 16,
    },
    langName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    langNameActive: {
        color: '#009FB7',
        fontWeight: '700',
    },
});