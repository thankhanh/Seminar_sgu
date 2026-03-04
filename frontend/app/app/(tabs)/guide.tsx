import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GuideScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* === HEADER === */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3 bg-white">
                <TouchableOpacity>
                    <Ionicons name="close" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-[#111827]">
                    Vinh Khanh Market
                </Text>
                <TouchableOpacity>
                    <Ionicons name="notifications-outline" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>
            <View className="h-[1px] w-full bg-[#F3F4F6]" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 130 }}
                className="flex-1"
            >
                <View className="px-5 pt-5">
                    {/* === NOW PLAYING WIDGET === */}
                    <View className="bg-[#FFF7ED] rounded-[24px] p-4 border border-[#FFEDD5] mb-6 relative shadow-sm">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center flex-1 pr-2">
                                <Image
                                    source={{ uri: 'https://cdn.tuoitre.vn/471584752817336320/2023/1/27/an-do-bien-4-16748057774021703901692.jpeg' }}
                                    className="w-[52px] h-[52px] rounded-xl mr-3"
                                />
                                <View>
                                    <Text className="text-[10px] font-extrabold text-[#E86B32] uppercase tracking-wider mb-0.5">
                                        Now Playing
                                    </Text>
                                    <Text className="text-[16px] font-extrabold text-[#1F2937] leading-tight mb-0.5">
                                        Seafood Street Guide
                                    </Text>
                                    <Text className="text-[12px] text-[#6B7280]">
                                        Stall #42 · 2:45 remaining
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity className="w-[46px] h-[46px] rounded-full bg-[#E86B32] items-center justify-center shadow-sm shadow-[#E86B32]/40">
                                <View className="flex-row space-x-1">
                                    <View className="w-1.5 h-3.5 bg-white rounded-sm" />
                                    <View className="w-1.5 h-3.5 bg-white rounded-sm ml-1" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Progress Bar */}
                        <View className="w-full h-1 bg-[#FDE6D5] rounded-full overflow-hidden">
                            <View className="w-[40%] h-full bg-[#E86B32] rounded-full" />
                        </View>
                    </View>

                    {/* === SEARCH BAR === */}
                    <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl h-[50px] px-4 mb-6">
                        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-2 text-base text-[#1F2937]"
                            placeholder="Search stall audio guides"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* === FILTER PILLS === */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="pl-5 mb-8"
                    contentContainerStyle={{ paddingRight: 40 }}
                >
                    <TouchableOpacity className="bg-[#E86B32] px-6 py-2.5 rounded-full mr-3 shadow-sm shadow-[#E86B32]/20">
                        <Text className="text-white text-[13px] font-bold">All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-[#F3F4F6] px-5 py-2.5 rounded-full mr-3">
                        <Text className="text-[#4B5563] text-[13px] font-bold">Recent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-[#F3F4F6] px-5 py-2.5 rounded-full mr-3">
                        <Text className="text-[#4B5563] text-[13px] font-bold">Favorites</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-[#F3F4F6] px-5 py-2.5 rounded-full mr-3 flex-row items-center">
                        <Text className="text-[#4B5563] text-[13px] font-bold mr-1">Category</Text>
                        <Ionicons name="chevron-down" size={14} color="#4B5563" />
                    </TouchableOpacity>
                </ScrollView>

                <View className="px-5">
                    <Text className="text-[13px] font-extrabold text-[#111827] tracking-wider uppercase mb-5">
                        Market Stories
                    </Text>

                    {/* === STORY ITEMS === */}
                    {[
                        {
                            id: 1,
                            title: "Oc Dao (Snail Paradise)",
                            image: "https://vcdn1-dulich.vnecdn.net/2021/01/18/vothilaus2-1610940428-16109559-6799-2810-1610955938.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=sQG3H9vE8p0A_B1z0c-xkg",
                            duration: "4:12",
                            category: "Seafood"
                        },
                        {
                            id: 2,
                            title: "Banh Xeo Auntie Muoi",
                            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq7Q063U58v3n1pZlPWeKx0R_O-v9vQ-q4vA&s",
                            duration: "3:45",
                            category: "Snacks"
                        },
                        {
                            id: 3,
                            title: "King of BBQ Skewers",
                            image: "https://foodtruckempire.com/wp-content/uploads/BBQ-skewers.jpg",
                            duration: "5:20",
                            category: "Grill"
                        },
                        {
                            id: 4,
                            title: "Market Coffee Legend",
                            image: "https://www.topcv.vn/v4/image/welcome/section-header/coffee.png",
                            duration: "2:50",
                            category: "Drinks"
                        }
                    ].map((item) => (
                        <View key={item.id} className="flex-row items-center justify-between mb-6">
                            <View className="flex-row items-center flex-1 pr-4">
                                <Image
                                    source={{ uri: item.image }}
                                    className="w-[56px] h-[56px] rounded-2xl mr-4 bg-gray-100"
                                />
                                <View>
                                    <Text className="text-[16px] font-extrabold text-[#111827] mb-0.5 leading-tight">
                                        {item.title}
                                    </Text>
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                                        <Text className="text-[12px] text-[#6B7280] ml-1">
                                            {item.duration} · {item.category}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity className="bg-[#F3F4F6] px-4 py-2.5 rounded-full">
                                <Text className="text-[#E86B32] text-[13px] font-bold">Listen</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
