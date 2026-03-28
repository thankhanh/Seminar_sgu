import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator, Modal, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from '../../../components/MapView';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../../constants/api';

const { width, height } = Dimensions.get('window');

// Map code ngôn ngữ sang mã giọng đọc của Speech API
const SPEECH_LANG_MAP: Record<string, string> = {
    vi: 'vi-VN',
    en: 'en-US',
    zh: 'zh-CN',
    ko: 'ko-KR',
    ja: 'ja-JP',
    fr: 'fr-FR',
    th: 'th-TH',
    de: 'de-DE',
    es: 'es-ES',
};

interface Language {
    id: string;
    code: string;
    name: string;
    flagIcon: string;
    isActive: boolean;
}

interface Store {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    coverImage?: string;
    status: string;
    _count?: { menus: number; narrations: number };
}

export default function MapScreen() {
    const router = useRouter();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoadingStores, setIsLoadingStores] = useState(true);
    const [selectedStall, setSelectedStall] = useState<Store | null>(null);
    const [lastNarratedStoreId, setLastNarratedStoreId] = useState<string | null>(null);
    const [isNarrating, setIsNarrating] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoadingLangs, setIsLoadingLangs] = useState(true);
    const [showLangPicker, setShowLangPicker] = useState(false);
    const isNarratingRef = useRef(false);
    const lastNarratedRef = useRef<string | null>(null);

    // Đồng bộ ref với state để dùng trong callback
    useEffect(() => { isNarratingRef.current = isNarrating; }, [isNarrating]);
    useEffect(() => { lastNarratedRef.current = lastNarratedStoreId; }, [lastNarratedStoreId]);

    // Fetch danh sách ngôn ngữ từ Backend
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const { data: json } = await api.get('/languages');
                if (json.success && Array.isArray(json.data)) {
                    const active = json.data.filter((l: Language) => l.isActive);
                    setLanguages(active);
                    const vi = active.find((l: Language) => l.code === 'vi') ?? active[0];
                    if (vi) setSelectedLanguage(vi);
                }
            } catch (error) {
                console.warn('Lỗi khi tải danh sách ngôn ngữ:', error);
            } finally {
                setIsLoadingLangs(false);
            }
        };
        fetchLanguages();
    }, []);

    // Fetch danh sách quán từ Backend
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const { data: json } = await api.get('/stores', {
                    params: { status: 'active', limit: 100 },
                });
                if (json.success && json.data?.data) {
                    setStores(json.data.data);
                }
            } catch (error) {
                console.warn('Lỗi khi tải danh sách quán:', error);
            } finally {
                setIsLoadingStores(false);
            }
        };
        fetchStores();
    }, []);
    const initialRegion = {
        latitude: 10.4967,
        longitude: 105.1167,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    // Theo dõi GPS
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const locationWatcher = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Balanced,
                    distanceInterval: 10,
                },
                (loc) => {
                    setLocation(loc);
                    checkNearbyNarration(loc.coords.latitude, loc.coords.longitude);
                }
            );
            return () => locationWatcher.remove();
        })();
    }, [selectedLanguage]); // Re-run khi đổi ngôn ngữ

    const checkNearbyNarration = async (lat: number, lng: number) => {
        if (!selectedLanguage) return;
        try {
            const { data: json } = await api.get('/nearby', {
                params: { lat, lng, lang: selectedLanguage.code },
            });
            const data = json.data ?? json;

            if (data.found && data.storeName) {
                if (data.storeName !== lastNarratedRef.current && !isNarratingRef.current) {
                    playNarration(data.textContent, data.storeName);
                }
            }
        } catch (error) {
            console.warn('Lỗi kết nối API thuyết minh:', error);
        }
    };

    const playNarration = (text: string, storeId: string) => {
        if (!selectedLanguage) return;
        setLastNarratedStoreId(storeId);
        setIsNarrating(true);

        Speech.speak(text, {
            language: SPEECH_LANG_MAP[selectedLanguage.code] ?? 'vi-VN',
            pitch: 1.0,
            rate: 0.9,
            onDone: () => setIsNarrating(false),
            onError: () => setIsNarrating(false),
        });
    };

    const stopNarration = () => {
        Speech.stop();
        setIsNarrating(false);
    };

    const userLocation = location
        ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
        : { latitude: 10.4967, longitude: 105.1167 };

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB] relative">
            <View className="flex-1">
                {/* === HEADER === */}
                <View className="flex-row items-center justify-between px-5 pt-4 pb-3 bg-[#F4FBFC] z-10">
                    <TouchableOpacity>
                        <Ionicons name="menu-outline" size={28} color="#1F2937" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-[14px] font-extrabold text-[#1F2937] tracking-wider uppercase">
                            Vinh Khanh Street
                        </Text>
                        <View className="flex-row items-center mt-0.5">
                            <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
                            <Text className="text-[10px] font-bold text-[#6B7280] tracking-widest uppercase">
                                Live Density Heatmap
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="options-outline" size={26} color="#1F2937" />
                    </TouchableOpacity>
                </View>
                <View className="h-[1px] w-full bg-[#F3F4F6] z-10" />

                {/* === LANGUAGE SELECTOR BUTTON === */}
                <View className="bg-[#F4FBFC] z-10 py-2 px-5 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => !isLoadingLangs && setShowLangPicker(true)}
                        className="flex-row items-center bg-white border border-[#E5E7EB] rounded-full px-4 py-2 shadow-sm"
                    >
                        {isLoadingLangs ? (
                            <ActivityIndicator size="small" color="#009FB7" style={{ marginRight: 6 }} />
                        ) : (
                            <Text className="text-base mr-2">{selectedLanguage?.flagIcon ?? '🌐'}</Text>
                        )}
                        <Text className="text-xs font-bold text-[#1F2937] mr-1">
                            {selectedLanguage?.name ?? 'Chọn ngôn ngữ'}
                        </Text>
                        <Ionicons name="chevron-down" size={12} color="#6B7280" />
                    </TouchableOpacity>
                    <Text className="text-[11px] text-[#9CA3AF] ml-3">Ngôn ngữ thuyết minh</Text>
                </View>

                {/* === LANGUAGE PICKER MODAL === */}
                <Modal
                    visible={showLangPicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowLangPicker(false)}
                >
                    <Pressable
                        className="flex-1 bg-black/40"
                        onPress={() => setShowLangPicker(false)}
                    >
                        <View
                            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8 pt-4 px-6"
                        >
                            <View className="w-12 h-1 rounded-full bg-[#E5E7EB] self-center mb-5" />
                            <Text className="text-[17px] font-extrabold text-[#1F2937] mb-4">
                                Chọn ngôn ngữ thuyết minh
                            </Text>
                            {languages.map((lang) => {
                                const isActive = selectedLanguage?.code === lang.code;
                                return (
                                    <TouchableOpacity
                                        key={lang.id}
                                        onPress={() => {
                                            if (isNarrating) stopNarration();
                                            setLastNarratedStoreId(null);
                                            setSelectedLanguage(lang);
                                            setShowLangPicker(false);
                                        }}
                                        className={`flex-row items-center px-4 py-3.5 rounded-2xl mb-2 ${isActive ? 'bg-[#009FB7]/10 border border-[#009FB7]' : 'bg-[#F9FAFB]'
                                            }`}
                                    >
                                        <Text className="text-2xl mr-4">{lang.flagIcon}</Text>
                                        <View className="flex-1">
                                            <Text className={`text-[15px] font-bold ${isActive ? 'text-[#009FB7]' : 'text-[#1F2937]'
                                                }`}>{lang.name}</Text>
                                            <Text className="text-xs text-[#9CA3AF]">
                                                {SPEECH_LANG_MAP[lang.code] ?? lang.code}
                                            </Text>
                                        </View>
                                        {isActive && <Ionicons name="checkmark-circle" size={22} color="#009FB7" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Modal>

                {/* === MAP AREA === */}
                <View className="flex-1 relative overflow-hidden">
                    <MapView
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={initialRegion}
                        provider={PROVIDER_DEFAULT}
                        showsUserLocation={false}
                    >
                        {/* User Location Marker */}
                        <Marker coordinate={userLocation} zIndex={100} anchor={{ x: 0.5, y: 0.5 }}>
                            <View className="items-center justify-center">
                                <View className="w-12 h-12 rounded-full bg-[#4F46E5]/20 items-center justify-center">
                                    <View className="w-6 h-6 rounded-full bg-[#4F46E5]/30 items-center justify-center">
                                        <View className="w-4 h-4 rounded-full bg-white items-center justify-center shadow-sm">
                                            <View className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </Marker>

                        {/* Store Markers từ API */}
                        {stores.map((store) => (
                            <Marker
                                key={store.id}
                                coordinate={{ latitude: store.lat, longitude: store.lng }}
                                zIndex={selectedStall?.id === store.id ? 99 : 90}
                                onPress={() => setSelectedStall(store)}
                            >
                                <View className="items-center mt-4">
                                    <View className={`px-4 py-2 rounded-2xl shadow-xl mb-1 items-center border-2 ${selectedStall?.id === store.id
                                        ? 'bg-[#009FB7] border-[#009FB7]'
                                        : 'bg-[#111827] border-[#111827]'
                                        }`}>
                                        <Text className="text-[11px] font-extrabold text-white tracking-wider uppercase">
                                            {store.name.length > 15 ? store.name.slice(0, 15) + '...' : store.name}
                                        </Text>
                                    </View>
                                    <View className="w-6 h-6 rounded-full bg-white items-center justify-center shadow-lg border border-gray-100">
                                        <View className={`w-3 h-3 rounded-full ${selectedStall?.id === store.id ? 'bg-[#009FB7]' : 'bg-[#111827]'
                                            }`} />
                                    </View>
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Loading indicator khi đang tải quán */}
                    {isLoadingStores && (
                        <View className="absolute top-4 left-1/2 -translate-x-12 z-20 bg-white rounded-full px-4 py-2 shadow-md flex-row items-center">
                            <ActivityIndicator size="small" color="#009FB7" />
                            <Text className="text-xs text-[#4B5563] ml-2">Đang tải quán...</Text>
                        </View>
                    )}

                    {/* Narration playing indicator */}
                    {isNarrating && (
                        <TouchableOpacity
                            onPress={stopNarration}
                            className="absolute top-4 left-4 z-20 bg-[#009FB7] rounded-full px-4 py-2 shadow-md flex-row items-center"
                        >
                            <Ionicons name="volume-high" size={14} color="white" />
                            <Text className="text-xs text-white font-bold ml-2">Đang đọc... (bấm dừng)</Text>
                        </TouchableOpacity>
                    )}

                    {/* --- FLOATING CONTROLS (Right Side) --- */}
                    <View className="absolute top-5 right-5 z-20">
                        <TouchableOpacity className="w-[42px] h-[42px] rounded-2xl bg-white items-center justify-center shadow-sm border border-gray-100">
                            <Ionicons name="locate" size={20} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>

                    {/* --- BOTTOM FLOATING CARD --- */}
                    {selectedStall && (
                        <View className="absolute bottom-[110px] w-full px-5 z-30">
                            <View className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100">
                                <View className="flex-row items-start mb-4">
                                    {selectedStall.coverImage ? (
                                        <Image
                                            source={{ uri: selectedStall.coverImage }}
                                            className="w-16 h-16 rounded-2xl bg-gray-100"
                                        />
                                    ) : (
                                        <View className="w-16 h-16 rounded-2xl bg-[#E5E7EB] items-center justify-center">
                                            <Ionicons name="storefront-outline" size={28} color="#9CA3AF" />
                                        </View>
                                    )}
                                    <View className="ml-3 flex-1 pt-1">
                                        <Text className="text-[17px] font-extrabold text-[#1F2937] leading-6">
                                            {selectedStall.name}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                                            <Text className="text-[12px] text-[#9CA3AF] ml-1" numberOfLines={1}>
                                                {selectedStall.address}
                                            </Text>
                                        </View>
                                        {selectedStall._count && (
                                            <View className="flex-row items-center mt-1">
                                                <Ionicons name="document-text-outline" size={11} color="#009FB7" />
                                                <Text className="text-[11px] text-[#009FB7] ml-1 font-semibold">
                                                    {selectedStall._count.narrations} thuyết minh
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setSelectedStall(null)}
                                        className="w-8 h-8 bg-[#F3F4F6] rounded-xl items-center justify-center"
                                    >
                                        <Ionicons name="close" size={16} color="#4B5563" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row items-center gap-3">
                                    <TouchableOpacity
                                        onPress={() => router.push(`/stall/${selectedStall.id}` as any)}
                                        className="flex-1 bg-[#009FB7] rounded-xl h-12 items-center justify-center shadow-lg"
                                    >
                                        <Text className="text-white text-[12px] font-extrabold tracking-widest uppercase">
                                            Xem Chi Tiết
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (isNarrating) { stopNarration(); return; }
                                            checkNearbyNarration(selectedStall.lat, selectedStall.lng);
                                        }}
                                        className={`w-12 h-12 rounded-xl items-center justify-center border ${isNarrating
                                            ? 'bg-[#009FB7] border-[#009FB7]'
                                            : 'bg-[#F3F4F6] border-gray-200'
                                            }`}
                                    >
                                        <Ionicons
                                            name={isNarrating ? 'stop' : 'volume-high-outline'}
                                            size={22}
                                            color={isNarrating ? 'white' : '#4B5563'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
