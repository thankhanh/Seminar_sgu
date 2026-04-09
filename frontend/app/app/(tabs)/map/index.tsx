import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator, Modal, Pressable, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from '../../../components/MapView';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api, { narrationsHelpers } from '../../../constants/api';
import ProximityAlert, { ProximityStore } from '../../../components/ProximityAlert';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usersHelpers, storeHelpers } from '../../../constants/api';

// ==========================================
// TỌA ĐỘ DÀNH CHO USER ĐỂ TEST (Cách gian hàng ~ 5 mét):
// 1. Gần Vinh Khanh Coffee Flagship: lat: 10.28405  | lng: 105.52044
// 2. Gần Thanh Khanh Food Express  : lat: 10.28305  | lng: 105.51884
// 3. Gần Thanh Khanh Food Flagship : lat: 10.28255  | lng: 105.51804
// ==========================================

const { width, height } = Dimensions.get('window');

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const SPEECH_LANG_MAP: Record<string, string> = {
    vi: 'vi-VN', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR',
    ja: 'ja-JP', fr: 'fr-FR', th: 'th-TH', de: 'de-DE', es: 'es-ES',
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
    // Dùng ngôn ngữ đã chọn toàn cục từ Home screen
    const { selectedLanguage, languages, setSelectedLanguage } = useLanguage();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoadingStores, setIsLoadingStores] = useState(true);
    const [selectedStall, setSelectedStall] = useState<Store | null>(null);
    const [lastNarratedStoreId, setLastNarratedStoreId] = useState<string | null>(null);
    const [isNarrating, setIsNarrating] = useState(false);
    const [isLoadingLangs] = useState(false); // Lấy từ context, không cần fetch riêng
    const [showLangPicker, setShowLangPicker] = useState(false);
    const [isLimitReached, setIsLimitReached] = useState(false);
    const [isNarrationDisabled, setIsNarrationDisabled] = useState(false);

    // Proximity alert queue
    const [proximityAlert, setProximityAlert] = useState<ProximityStore | null>(null);
    const proximityQueueRef = useRef<ProximityStore[]>([]);
    const dismissedStoresRef = useRef<Set<string>>(new Set());

    const isNarratingRef = useRef(false);
    const lastNarratedRef = useRef<string | null>(null);
    const storesRef = useRef<Store[]>([]);
    const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

    useEffect(() => { isNarratingRef.current = isNarrating; }, [isNarrating]);
    useEffect(() => { lastNarratedRef.current = lastNarratedStoreId; }, [lastNarratedStoreId]);
    useEffect(() => { storesRef.current = stores; }, [stores]);

    // Fetch limit status & stores
    useEffect(() => {
        const fetchLimitStatus = async () => {
            try {
                const profile = await usersHelpers.getProfile();
                if (profile && profile.data) setIsLimitReached(profile.data.isLimitReached);
            } catch (error) {
                console.warn('Lỗi khi tải limit status:', error);
            }
        };
        const fetchStores = async () => {
            try {
                const data = await storeHelpers.getStore();
                if (data && data?.data) {
                    setStores(data.data);
                }
            } catch (error) {
                console.warn('Lỗi khi tải danh sách quán:', error);
            } finally {
                setIsLoadingStores(false);
            }
        };
        fetchLimitStatus();
        fetchStores();
    }, []);

    // Khi stores load xong, kiểm tra lại proximity với vị trí GPS mới nhất
    useEffect(() => {
        if (stores.length > 0 && lastLocationRef.current) {
            const { lat, lng } = lastLocationRef.current;
            checkProximity(lat, lng);
        }
    }, [stores]);

    const initialRegion = {
        latitude: 10.4967,
        longitude: 105.1167,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    // GPS watcher
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const locationWatcher = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
                (loc) => {
                    setLocation(loc);
                    // TEST: Uncomment để test gần Vinh Khanh Coffee
                    checkProximity(10.28405, 105.52044);
                    lastLocationRef.current = { lat: 10.28405, lng: 105.52044 };
                    // checkProximity(loc.coords.latitude, loc.coords.longitude);
                    // lastLocationRef.current = { lat: loc.coords.latitude, lng: loc.coords.longitude };
                }
            );
            return () => locationWatcher.remove();
        })();
    }, [selectedLanguage]);

    // Tìm tất cả POI trong 10m, sort theo khoảng cách, queue lần lượt
    const checkProximity = (lat: number, lng: number) => {
        if (storesRef.current.length === 0) return;

        const nearby: ProximityStore[] = storesRef.current
            .map(store => ({
                id: store.id,
                name: store.name,
                address: store.address,
                coverImage: store.coverImage,
                distance: haversineDistance(lat, lng, store.lat, store.lng),
            }))
            .filter(s => s.distance <= 10)
            .sort((a, b) => a.distance - b.distance);

        const undismissed = nearby.filter(s => !dismissedStoresRef.current.has(s.id));

        if (undismissed.length > 0) {
            proximityQueueRef.current = undismissed;
            // Chỉ set alert nếu chưa đang hiện alert nào
            setProximityAlert(prev => prev ? prev : undismissed[0]);
        }
    };

    // User đồng ý → navigate đến stall
    const handleProximityConfirm = (store: ProximityStore) => {
        dismissedStoresRef.current.add(store.id);
        setProximityAlert(null);
        router.push(`/stall/${store.id}` as any);
    };

    // User bỏ qua → show POI tiếp theo trong queue
    const handleProximityDismiss = (store: ProximityStore) => {
        dismissedStoresRef.current.add(store.id);
        const remaining = proximityQueueRef.current.filter(
            s => !dismissedStoresRef.current.has(s.id)
        );
        proximityQueueRef.current = remaining;
        setProximityAlert(remaining.length > 0 ? remaining[0] : null);
    };

    const checkNearbyNarration = async (lat: number, lng: number) => {
        if (!selectedLanguage || isLimitReached) return;
        try {
            const { data: json } = await storeHelpers.checkNearBy(lat, lng, selectedLanguage.code);
            const data = json.data ?? json;
            if (data.found && data.storeName) {
                if (data.storeName !== lastNarratedRef.current && !isNarratingRef.current) {
                    playNarration(data.textContent, data.storeName);
                }
                setIsNarrationDisabled(false);
            } else {
                setIsNarrationDisabled(true);
            }
        } catch (error) {
            console.warn('Lỗi kết nối API thuyết minh:', error);
        }
    };

    const handleListen = async (store: any) => {
        if (isNarrating) { stopNarration(); return; }
        if (isLimitReached) {
            Alert.alert('Giới hạn lượt nghe', 'Bạn đã hết lượt nghe trong ngày. Vui lòng nâng cấp gói.');
            return;
        }
        checkNearbyNarration(store.lat, store.lng);
        const data = narrationsHelpers.addListenHistory(store.id);
        if (!data) {
            Alert.alert('Lỗi', 'Không thể thêm lịch sử nghe.');
            return;
        }
    }

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

                {/* === LANGUAGE SELECTOR === */}
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
                    <Pressable className="flex-1 bg-black/40" onPress={() => setShowLangPicker(false)}>
                        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8 pt-4 px-6">
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
                                        className={`flex-row items-center px-4 py-3.5 rounded-2xl mb-2 ${isActive ? 'bg-[#009FB7]/10 border border-[#009FB7]' : 'bg-[#F9FAFB]'}`}
                                    >
                                        <Text className="text-2xl mr-4">{lang.flagIcon}</Text>
                                        <View className="flex-1">
                                            <Text className={`text-[15px] font-bold ${isActive ? 'text-[#009FB7]' : 'text-[#1F2937]'}`}>
                                                {lang.name}
                                            </Text>
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

                        {/* Store Markers */}
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
                                        <View className={`w-3 h-3 rounded-full ${selectedStall?.id === store.id ? 'bg-[#009FB7]' : 'bg-[#111827]'}`} />
                                    </View>
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Loading indicator */}
                    {isLoadingStores && (
                        <View className="absolute top-4 left-1/2 -translate-x-12 z-20 bg-white rounded-full px-4 py-2 shadow-md flex-row items-center">
                            <ActivityIndicator size="small" color="#009FB7" />
                            <Text className="text-xs text-[#4B5563] ml-2">Đang tải quán...</Text>
                        </View>
                    )}

                    {/* Narration indicator */}
                    {isNarrating && (
                        <TouchableOpacity
                            onPress={stopNarration}
                            className="absolute top-4 left-4 z-20 bg-[#009FB7] rounded-full px-4 py-2 shadow-md flex-row items-center"
                        >
                            <Ionicons name="volume-high" size={14} color="white" />
                            <Text className="text-xs text-white font-bold ml-2">Đang đọc... (bấm dừng)</Text>
                        </TouchableOpacity>
                    )}

                    {/* Floating Controls */}
                    <View className="absolute top-5 right-5 z-20">
                        <TouchableOpacity className="w-[42px] h-[42px] rounded-2xl bg-white items-center justify-center shadow-sm border border-gray-100">
                            <Ionicons name="locate" size={20} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Stall Detail Card */}
                    {selectedStall && (
                        <View className="absolute bottom-[110px] w-full px-5 z-30">
                            <View className="bg-white rounded-3xl p-4 shadow-xl border border-gray-100">
                                <View className="flex-row items-start mb-4">
                                    {selectedStall.coverImage ? (
                                        <Image source={{ uri: selectedStall.coverImage }} className="w-16 h-16 rounded-2xl bg-gray-100" />
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
                                            handleListen(selectedStall);
                                        }}
                                        disabled={(isLimitReached || isNarrationDisabled) && !isNarrating}
                                        className={`w-12 h-12 rounded-xl items-center justify-center border ${isNarrating
                                            ? 'bg-[#009FB7] border-[#009FB7]'
                                            : (isLimitReached || isNarrationDisabled) && !isNarrating
                                                ? 'bg-gray-200 border-gray-300'
                                                : 'bg-[#F3F4F6] border-gray-200'
                                            }`}
                                    >
                                        <Ionicons
                                            name={isNarrating ? 'stop' : 'volume-high-outline'}
                                            size={22}
                                            color={isNarrating ? 'white' : isLimitReached ? '#9CA3AF' : '#4B5563'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* === PROXIMITY ALERT COMPONENT === */}
                <ProximityAlert
                    store={proximityAlert}
                    onConfirm={handleProximityConfirm}
                    onDismiss={handleProximityDismiss}
                />
            </View>
        </SafeAreaView>
    );
}
