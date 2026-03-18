import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    const initialRegion = {
        latitude: 10.7610,
        longitude: 106.7032,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
        })();
    }, []);

    const userLocation = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
    } : {
        latitude: 10.7610, // Vĩnh Khánh default
        longitude: 106.7032
    };

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

                {/* === FILTER CATEGORIES === */}
                <View className="bg-[#F4FBFC] z-10 pb-3">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="px-5 pt-3"
                        contentContainerStyle={{ paddingRight: 40 }}
                    >
                        <TouchableOpacity className="bg-[#111827] px-4 py-2 rounded-full mr-3 flex-row items-center">
                            <Text className="text-white text-xs font-bold leading-5">All Stalls</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-white border border-[#E5E7EB] px-4 py-2 rounded-full mr-3 flex-row items-center">
                            <FontAwesome5 name="fish" size={12} color="#4B5563" />
                            <Text className="text-[#4B5563] text-xs font-bold ml-2 leading-5">Seafood</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-white border border-[#E5E7EB] px-4 py-2 rounded-full mr-3 flex-row items-center">
                            <FontAwesome5 name="glass-martini-alt" size={12} color="#4B5563" />
                            <Text className="text-[#4B5563] text-xs font-bold ml-2 leading-5">Drinks</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-white border border-[#E5E7EB] px-4 py-2 rounded-full mr-3 flex-row items-center">
                            <Ionicons name="star-outline" size={14} color="#4B5563" />
                            <Text className="text-[#4B5563] text-xs font-bold ml-1.5 leading-5">Top Rated</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* === MAP AREA === */}                <View className="flex-1 relative overflow-hidden">
                    <MapView 
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={initialRegion}
                        provider={PROVIDER_DEFAULT}
                        showsUserLocation={false}
                    >
                        {/* User Location Marker */}
                        <Marker coordinate={userLocation} zIndex={100} anchor={{x: 0.5, y: 0.5}}>
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

                        {/* Marker 1: #12 */}
                        <Marker coordinate={{ latitude: 10.7618, longitude: 106.7020 }}>
                            <View className="items-center">
                                <View className="bg-white px-2 py-1 rounded shadow-sm mb-1 border border-gray-100">
                                    <Text className="text-[10px] font-extrabold text-[#1F2937]">#12</Text>
                                </View>
                                <View className="w-4 h-4 rounded-full bg-white items-center justify-center shadow-sm">
                                    <View className="w-2 h-2 rounded-full bg-[#1F2937]" />
                                </View>
                            </View>
                        </Marker>

                        {/* Marker 2: #15 */}
                        <Marker coordinate={{ latitude: 10.7605, longitude: 106.7040 }}>
                            <View className="items-center">
                                <View className="bg-white px-2 py-1 rounded shadow-sm mb-1 border border-gray-100">
                                    <Text className="text-[10px] font-extrabold text-[#1F2937]">#15</Text>
                                </View>
                                <View className="w-4 h-4 rounded-full bg-white items-center justify-center shadow-sm">
                                    <View className="w-2 h-2 rounded-full bg-[#1F2937]" />
                                </View>
                            </View>
                        </Marker>

                        {/* Marker 3: Oc Oanh Tooltip */}
                        <Marker coordinate={{ latitude: 10.7612, longitude: 106.7025 }} zIndex={90}>
                            <View className="items-center">
                                <View className="bg-[#111827] px-3 py-2 rounded-xl shadow-lg mb-2 items-center">
                                    <Text className="text-[10px] font-bold text-white uppercase tracking-wider mb-0.5">Oc Oanh</Text>
                                    <View className="flex-row items-center">
                                        <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
                                        <Text className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Crowded</Text>
                                    </View>
                                </View>
                                <View className="w-6 h-6 rounded-full bg-white/80 items-center justify-center shadow-sm">
                                    <View className="w-4 h-4 rounded-full bg-white items-center justify-center shadow-sm">
                                        <View className="w-2.5 h-2.5 rounded-full bg-[#111827]" />
                                    </View>
                                </View>
                            </View>
                        </Marker>
                    </MapView>
                    {/* --- FLOATING CONTROLS (Right Side) --- */}
                    <View className="absolute top-5 right-5 z-20">
                        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                            <TouchableOpacity className="w-[42px] h-[42px] items-center justify-center border-b border-gray-50">
                                <Ionicons name="add" size={20} color="#1F2937" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-[42px] h-[42px] items-center justify-center">
                                <Ionicons name="remove" size={20} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity className="w-[42px] h-[42px] rounded-2xl bg-[#009FB7] items-center justify-center shadow-sm shadow-[#009FB7]/30 mb-4">
                            <Ionicons name="sunny" size={20} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity className="w-[42px] h-[42px] rounded-2xl bg-white items-center justify-center shadow-sm border border-gray-100">
                            <Ionicons name="locate" size={20} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>

                    {/* --- BOTTOM FLOATING CARD --- */}
                    <View className="absolute bottom-[110px] w-full px-5 z-30">
                        <View className="bg-white rounded-3xl p-4 shadow-lg shadow-black/10">
                            <View className="flex-row items-start mb-4">
                                <Image
                                    source={{ uri: 'https://i.pinimg.com/736x/8f/ba/b6/8fbab6011c778408f65cc9e95fae4680.jpg' }}
                                    className="w-16 h-16 rounded-2xl bg-gray-100"
                                />
                                <View className="ml-3 flex-1 pt-1">
                                    <Text className="text-[17px] font-extrabold text-[#1F2937] leading-6">Oc Oanh Seafood</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="star" size={12} color="#F59E0B" />
                                        <Text className="text-[12px] font-bold text-[#1F2937] ml-1 mr-2">4.8</Text>
                                        <Text className="text-[12px] text-[#9CA3AF]">#08 · Vinh Khanh St.</Text>
                                    </View>
                                </View>
                                <View className="bg-red-600 px-2 py-1 rounded-lg">
                                    <Text className="text-[9px] font-extrabold text-white tracking-wider uppercase">Peak Heat</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <TouchableOpacity className="flex-1 bg-[#111827] rounded-xl h-12 items-center justify-center mr-3 shadow-md">
                                    <Text className="text-white text-[11px] font-extrabold tracking-widest uppercase">Navigate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="w-12 h-12 bg-[#F3F4F6] rounded-xl items-center justify-center">
                                    <Ionicons name="information-circle-outline" size={24} color="#4B5563" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
