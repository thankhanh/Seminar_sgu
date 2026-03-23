import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
export default function Audio({ stall }: any) {
    const [isPlaying, setIsPlaying] = useState(false);
    return (
        <View className="rounded-xl bg-[#F3F4F6] p-5">
            <View className="items-center mt-6">
                <View className="w-24 h-24 rounded-full bg-[#F4FBFC] items-center justify-center border-4 border-[#B3EBF2] shadow-sm mb-6 relative overflow-hidden">
                    {isPlaying ? <View className="absolute inset-0 bg-[#009FB7] opacity-10" /> : null}
                    <Ionicons name={isPlaying ? "headset" : "headset-outline"} size={40} color="#009FB7" />
                </View>

                <Text className="text-[#1F2937] font-bold text-lg text-center mb-1">{stall.audio.title}</Text>
                <Text className="text-[#6B7280] text-[13px]">Tour Ẩm Thực Vĩnh Khánh</Text>

                <View className="w-full mt-8">
                    {/* Progress Bar */}
                    <View className="w-full h-1.5 bg-gray-200 rounded-full mb-3">
                        <View className="w-1/3 h-1.5 bg-[#009FB7] rounded-full" />
                    </View>
                    <View className="flex-row justify-between w-full">
                        <Text className="text-xs text-[#6B7280] font-medium">1:15</Text>
                        <Text className="text-xs text-[#6B7280] font-medium">{stall.audio.duration}</Text>
                    </View>
                </View>

                {/* Controls */}
                <View className="flex-row items-center justify-center mt-8 w-full gap-8">
                    <TouchableOpacity>
                        <Ionicons name="play-skip-back" size={32} color="#4B5563" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 rounded-full bg-[#009FB7] items-center justify-center shadow-lg"
                    >
                        <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Ionicons name="play-skip-forward" size={32} color="#4B5563" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}