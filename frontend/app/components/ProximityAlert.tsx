import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';


const { width } = Dimensions.get('window');

export interface ProximityStore {
    id: string;
    name: string;
    address: string;
    coverImage?: string;
    distance: number; // mét
}

interface ProximityAlertProps {
    store: ProximityStore | null;
    onConfirm: (store: ProximityStore) => void;
    onDismiss: (store: ProximityStore) => void;
}

export default function ProximityAlert({ store, onConfirm, onDismiss }: ProximityAlertProps) {
    const { t } = useLanguage();
    const slideAnim = useRef(new Animated.Value(200)).current;

    const opacityAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Slide-in khi store thay đổi
    useEffect(() => {
        if (store) {
            // Reset về dưới trước khi animate lên
            slideAnim.setValue(200);
            opacityAnim.setValue(0);

            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 60,
                    friction: 10,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();

            // Pulse animation cho icon vị trí
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            // Slide out
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 200,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [store?.id]);

    if (!store) return null;

    const distanceText = store.distance < 1000
        ? `${Math.round(store.distance)}m`
        : `${(store.distance / 1000).toFixed(1)}km`;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                bottom: 120,
                left: 16,
                right: 16,
                zIndex: 100,
                transform: [{ translateY: slideAnim }],
                opacity: opacityAnim,
            }}
        >
            {/* Card chính */}
            <View style={{
                backgroundColor: 'white',
                borderRadius: 24,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.18,
                shadowRadius: 20,
                elevation: 12,
                borderWidth: 1,
                borderColor: '#E5F9FC',
            }}>
                {/* Dải màu top */}
                <View style={{ backgroundColor: '#009FB7', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                            <Ionicons name="location" size={16} color="white" />
                        </View>
                    </Animated.View>
                     <Text style={{ color: 'white', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', flex: 1 }}>
                        📍 {t('proximity.title')} · {distanceText}
                    </Text>

                    <TouchableOpacity
                        onPress={() => onDismiss(store)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="close" size={18} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                </View>

                {/* Nội dung */}
                <View style={{ flexDirection: 'row', padding: 14, alignItems: 'center' }}>
                    {/* Ảnh quán */}
                    {store.coverImage ? (
                        <Image
                            source={{ uri: store.coverImage }}
                            style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#E5E7EB' }}
                        />
                    ) : (
                        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#F0FAFB', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#B3EBF2' }}>
                            <Ionicons name="storefront" size={28} color="#009FB7" />
                        </View>
                    )}

                    {/* Thông tin */}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 3 }} numberOfLines={1}>
                            {store.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                            <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 3, flex: 1 }} numberOfLines={1}>
                                {store.address}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 11, color: '#009FB7', fontWeight: '700', marginTop: 4 }}>
                            🎧 {t('proximity.has_narration')}
                        </Text>

                    </View>
                </View>

                {/* Câu hỏi */}
                <View style={{ paddingHorizontal: 14, paddingBottom: 6 }}>
                    <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600', textAlign: 'center' }}>
                        {t('proximity.ask')}
                    </Text>
                </View>


                {/* Nút bấm */}
                <View style={{ flexDirection: 'row', padding: 12, gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => onDismiss(store)}
                        style={{
                            flex: 1,
                            paddingVertical: 13,
                            borderRadius: 14,
                            backgroundColor: '#F3F4F6',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                        }}
                    >
                        <Ionicons name="arrow-forward" size={14} color="#6B7280" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', marginLeft: 5 }}>
                            {t('proximity.skip')}
                        </Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        onPress={() => onConfirm(store)}
                        style={{
                            flex: 2,
                            paddingVertical: 13,
                            borderRadius: 14,
                            backgroundColor: '#009FB7',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            shadowColor: '#009FB7',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                    >
                        <Ionicons name="headset" size={16} color="white" />
                        <Text style={{ fontSize: 14, fontWeight: '800', color: 'white', marginLeft: 6 }}>
                            {t('proximity.confirm')}
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Animated.View>
    );
}
