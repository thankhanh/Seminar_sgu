import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data based on ID
const MOCK_STALLS: any = {
    '1': {
        name: 'Ốc Oanh',
        tag: 'Seafood',
        rating: 4.8,
        reviews: 320,
        address: '#08 Vĩnh Khánh, Q4',
        image: 'https://i.pinimg.com/736x/8f/ba/b6/8fbab6011c778408f65cc9e95fae4680.jpg',
        description: 'Quán Ốc Oanh nổi tiếng với các món ốc tươi sống, hải sản đa dạng được chế biến đậm đà theo phong cách Sài Gòn đặc trưng.',
        menu: [
            { id: 1, name: 'Ốc Hương Xào Bơ Tỏi', price: '120.000đ', image: 'https://cdn.tgdd.vn/Files/2021/04/09/1342137/cach-lam-oc-huong-xao-bo-toi-thom-ngon-don-gian-nhat-cho-ca-nha-202201112217154238.jpg' },
            { id: 2, name: 'Càng Ghẹ Rang Muối', price: '150.000đ', image: 'https://cdn.tgdd.vn/Files/2020/07/21/1272365/2-cach-lam-cang-ghe-rang-muoi-ot-va-muoi-tom-tay-ninh-cay-ngon-cuc-hic-202201041659103859.jpg' },
        ],
        audio: { title: 'Lịch sử Ốc Oanh', duration: '3:45' }
    },
    '2': {
        name: 'Quầy #12 - Chè Ngon',
        tag: 'Dessert',
        rating: 4.5,
        reviews: 156,
        address: '#12 Vĩnh Khánh, Q4',
        image: 'https://cdn.tgdd.vn/2020/09/CookProduct/sdsd-1200x676.jpg',
        description: 'Chuyên các loại chè Nam Bộ thanh mát, ngọt dịu. Các nguyên liệu được nấu thủ công mỗi ngày.',
        menu: [
            { id: 1, name: 'Chè Khúc Bạch', price: '35.000đ', image: 'https://cdn.tgdd.vn/2021/05/CookRecipe/GalleryStep/thanh-pham-1801.jpg' },
            { id: 2, name: 'Chè Bưởi', price: '25.000đ', image: 'https://cdn.tgdd.vn/2020/09/CookProduct/1200-1200x676-5.jpg' },
        ],
        audio: { title: 'Cách nấu chè truyền thống', duration: '2:10' }
    },
    '3': {
        name: 'Quầy #15 - Bánh Tráng',
        tag: 'Street Food',
        rating: 4.2,
        reviews: 420,
        address: '#15 Vĩnh Khánh, Q4',
        image: 'https://cdn.tgdd.vn/Files/2019/12/28/1228945/cach-lam-banh-trang-tron-tai-nha-ngon-nhu-ngoai-hang-202112310931165261.jpeg',
        description: 'Bánh tráng trộn siêu topping với khô bò, trứng cút, mỡ hành tép sấy. Vị cay cay mặn ngọt chuẩn vị sinh viên.',
        menu: [
            { id: 1, name: 'Bánh Tráng Trộn Đặc Biệt', price: '25.000đ', image: 'https://static.vinwonders.com/production/banh-trang-tron-1.jpg' },
        ],
        audio: { title: 'Văn hóa Bánh Tráng Trộn', duration: '1:50' }
    }
};

export default function StallDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const pathName = usePathname();
    const [activeTab, setActiveTab] = useState<'intro' | 'menu' | 'audio'>('intro');
    const [isPlaying, setIsPlaying] = useState(false);

    const id = params?.id;
    // Luôn ép kiểu về string để khớp với Key của MOCK_STALLS
    const stallId = (id && MOCK_STALLS[id as string]) ? (id as string) : '1';
    const stall = MOCK_STALLS[stallId];

    useEffect(() => {

        console.log('PathName: ', pathName);
        console.log('ActiveTab: ', activeTab);
        console.log('Stall: ', stall);
    }, []);
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* HERO IMAGE */}
                <View className="relative w-full h-[280px]">
                    <Image source={{ uri: stall.image }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute inset-0 bg-black/40" />

                    {/* Header Actions */}
                    <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center z-10">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row">
                            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30 mr-2">
                                <Ionicons name="share-social-outline" size={22} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/30">
                                <Ionicons name="heart-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Bottom Info inside Hero */}
                    <View className="absolute bottom-4 left-4 right-4">
                        <View className="bg-[#009FB7] px-2 py-1 rounded-md self-start mb-2">
                            <Text className="text-[10px] font-bold text-white uppercase tracking-wider">{stall.tag}</Text>
                        </View>
                        <Text className="text-3xl font-extrabold text-white shadow-lg">{stall.name}</Text>
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="location-outline" size={14} color="white" />
                            <Text className="text-white text-xs font-medium ml-1 mr-4">{stall.address}</Text>
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text className="text-white text-xs font-bold ml-1">{stall.rating}</Text>
                            <Text className="text-white/80 text-xs ml-1">({stall.reviews})</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-white rounded-t-3xl -mt-4 pt-6 px-5 flex-1 min-h-[500px]">
                    {/* TABS SEGMENTED CONTROL */}
                    <View className="flex-row bg-[#F3F4F6] rounded-xl p-1 mb-6">
                        <TouchableOpacity
                            onPress={() => setActiveTab('intro')}
                            className={`flex-1 py-2.5 items-center rounded-lg ${activeTab === 'intro' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-[13px] font-bold ${activeTab === 'intro' ? 'text-[#009FB7]' : 'text-[#6B7280]'}`}>Giới Thiệu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('menu')}
                            className={`flex-1 py-2.5 items-center rounded-lg ${activeTab === 'menu' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-[13px] font-bold ${activeTab === 'menu' ? 'text-[#009FB7]' : 'text-[#6B7280]'}`}>Thực Đơn</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('audio')}
                            className={`flex-1 py-2.5 items-center rounded-lg ${activeTab === 'audio' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-[13px] font-bold ${activeTab === 'audio' ? 'text-[#009FB7]' : 'text-[#6B7280]'}`}>Thuyết Minh</Text>
                        </TouchableOpacity>
                    </View>
                    {/* <View>
                        <Text> {JSON.stringify(params)} {pathName}</Text>
                    </View> */}

                    {/* TAB CONTENT: INTRODUCTION */}
                    {activeTab === 'intro' ? (
                        <View>
                            <Text className="text-[#1F2937] text-base leading-6 font-medium">
                                {stall.description}
                            </Text>

                            <View className="mt-8 flex-row items-center justify-between p-4 bg-[#F4FBFC] border border-[#B3EBF2] rounded-2xl">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-[#009FB7] items-center justify-center">
                                        <Ionicons name="time-outline" size={20} color="white" />
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-[#1F2937] font-bold text-[13px]">Giờ hoạt động</Text>
                                        <Text className="text-[#4B5563] text-xs mt-0.5">16:00 - 23:30 hằng ngày</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : null}

                    {/* TAB CONTENT: MENU */}
                    {activeTab === 'menu' ? (
                        <View>
                            {stall.menu.map((item: any) => (
                                <View key={item.id} className="flex-row items-center bg-white border border-gray-100 p-3 rounded-2xl mb-3 shadow-sm">
                                    <Image source={{ uri: item.image }} className="w-20 h-20 rounded-xl bg-gray-100" />
                                    <View className="flex-1 ml-3 h-20 justify-center">
                                        <Text className="text-[#1F2937] font-bold text-[15px] mb-2">{item.name}</Text>
                                        <Text className="text-[#009FB7] font-extrabold text-[14px]">{item.price}</Text>
                                    </View>
                                    <TouchableOpacity className="w-8 h-8 rounded-full bg-[#F4FBFC] items-center justify-center">
                                        <Ionicons name="add" size={20} color="#009FB7" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : null}

                    {/* TAB CONTENT: AUDIO */}
                    {activeTab === 'audio' ? (
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
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
