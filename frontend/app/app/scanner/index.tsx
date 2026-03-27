import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../constants/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function QRScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const router = useRouter();

    if (!permission) {
        return <View className="flex-1 bg-black" />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-[#F4FBFC]">
                <Ionicons name="camera-outline" size={64} color="#009FB7" className="mb-4" />
                <Text className="text-lg font-bold text-[#1F2937] mb-2 mt-4 text-center">
                    Yêu cầu quyền Camera
                </Text>
                <Text className="text-sm text-[#6B7280] text-center mb-8 px-8 leading-6">
                    Chúng tôi cần truy cập máy ảnh của bạn để quét mã QR. 
                </Text>
                
                <TouchableOpacity 
                    onPress={requestPermission} 
                    className="bg-[#009FB7] w-[80%] py-4 rounded-2xl items-center shadow-lg shadow-[#009FB7]/40 mb-4"
                >
                    <Text className="text-white font-extrabold text-[15px]">Cấp Quyền Camera</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="w-[80%] py-4 rounded-2xl items-center bg-white border border-[#E5E7EB]"
                >
                    <Text className="text-[#4B5563] font-bold text-[15px]">Quay Lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleBarcodeScanned = async ({ type, data }: any) => {
        if (scanned) return;
        setScanned(true);
        console.log(`[Scanner] Scanned QR Code: ${data}`);
        
        try {
            // data can be a full URL or just a code. 
            // In our system, we expect the code.
            const { data: json } = await api.post(`/qr/scan/${data}`);
            
            if (json.success && json.data?.storeId) {
                // Navigate to stall detail
                router.replace(`/stall/${json.data.storeId}` as any);
            } else {
                alert('Mã QR không hợp lệ hoặc không tồn tại trong hệ thống.');
            }
        } catch (error: any) {
            console.warn('[Scanner] Error scanning QR:', error);
            const errMsg = error.response?.data?.error?.message || 'Có lỗi xảy ra khi kết nối máy chủ.';
            alert(`Lỗi: ${errMsg}`);
        }
    };

    return (
        <View className="flex-1 bg-black relative">
            <CameraView 
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            >
                {/* --- HEADER --- */}
                <SafeAreaView edges={['top']} className="flex-row items-center justify-between px-6 pt-4 z-10 w-full absolute top-0">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-12 h-12 rounded-full bg-black/50 items-center justify-center border border-white/20"
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    
                    <View className="bg-black/50 px-5 py-2 rounded-full border border-white/20">
                        <Text className="text-white text-sm font-bold tracking-wider">Quét Mã QR</Text>
                    </View>
                    
                    <TouchableOpacity className="w-12 h-12 rounded-full bg-black/50 items-center justify-center border border-white/20">
                        <Ionicons name="flash-outline" size={22} color="white" />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* --- SCANNER OVERLAY --- */}
                <View className="flex-1 justify-center items-center w-full">
                    {/* Dark Overlays around the active scan area */}
                    <View style={styles.overlayTop} />
                    <View style={styles.overlayBottom} />
                    <View style={styles.overlayLeft} />
                    <View style={styles.overlayRight} />

                    {/* Scan Frame */}
                    <View style={styles.scanArea}>
                        {/* 4 Corners */}
                        <View style={[styles.corner, styles.topLeftCorner]} />
                        <View style={[styles.corner, styles.topRightCorner]} />
                        <View style={[styles.corner, styles.bottomLeftCorner]} />
                        <View style={[styles.corner, styles.bottomRightCorner]} />

                        {/* Animated Line Mock */}
                        <View className="w-full h-[2px] bg-[#009FB7] absolute top-1/2 opacity-80" 
                              style={{ shadowColor: '#009FB7', shadowOffset: {width: 0, height: 2}, shadowOpacity: 1, shadowRadius: 6}} />
                    </View>
                    
                    {/* Bottom Instructions */}
                    <View className="absolute bottom-[15%] items-center w-full px-10 z-20">
                        <View className="bg-black/60 px-6 py-3 rounded-2xl flex-row items-center backdrop-blur-md">
                            <Ionicons name="scan-outline" size={20} color="#009FB7" />
                            <Text className="text-white text-[13px] font-medium ml-2">
                                Di chuyển camera vào mã QR
                            </Text>
                        </View>
                        
                        {scanned && (
                            <TouchableOpacity 
                                onPress={() => setScanned(false)}
                                className="bg-[#009FB7] px-10 py-4 rounded-full mt-6 flex-row items-center shadow-lg shadow-[#009FB7]/50"
                            >
                                <Ionicons name="refresh-outline" size={20} color="white" />
                                <Text className="text-white font-extrabold ml-2 text-[15px]">Quét Lại</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const overlayColor = 'rgba(0,0,0,0.65)';
const scanAreaSize = width * 0.7;

const styles = StyleSheet.create({
    overlayTop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: '50%',
        marginBottom: scanAreaSize / 2,
        backgroundColor: overlayColor,
    },
    overlayBottom: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0, top: '50%',
        marginTop: scanAreaSize / 2,
        backgroundColor: overlayColor,
    },
    overlayLeft: {
        position: 'absolute',
        top: '50%', bottom: '50%', left: 0, right: '50%',
        marginTop: -scanAreaSize / 2, marginBottom: -scanAreaSize / 2, marginRight: scanAreaSize / 2,
        backgroundColor: overlayColor,
    },
    overlayRight: {
        position: 'absolute',
        top: '50%', bottom: '50%', right: 0, left: '50%',
        marginTop: -scanAreaSize / 2, marginBottom: -scanAreaSize / 2, marginLeft: scanAreaSize / 2,
        backgroundColor: overlayColor,
    },
    scanArea: {
        width: scanAreaSize, height: scanAreaSize,
        backgroundColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: 44, height: 44,
        borderColor: '#009FB7',
    },
    topLeftCorner: {
        top: 0, left: 0,
        borderTopWidth: 5, borderLeftWidth: 5,
        borderTopLeftRadius: 20,
    },
    topRightCorner: {
        top: 0, right: 0,
        borderTopWidth: 5, borderRightWidth: 5,
        borderTopRightRadius: 20,
    },
    bottomLeftCorner: {
        bottom: 0, left: 0,
        borderBottomWidth: 5, borderLeftWidth: 5,
        borderBottomLeftRadius: 20,
    },
    bottomRightCorner: {
        bottom: 0, right: 0,
        borderBottomWidth: 5, borderRightWidth: 5,
        borderBottomRightRadius: 20,
    },
});
