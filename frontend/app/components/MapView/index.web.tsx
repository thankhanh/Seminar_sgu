import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MapView = ({ children, style, ...props }: any) => {
    return (
        <View style={[style, styles.container]} {...props}>
            <View style={styles.webMessageContainer}>
                <Text style={styles.webMessageTitle}>Bản đồ không hỗ trợ trên Web</Text>
                <Text style={styles.webMessageText}>Vui lòng mở ứng dụng trên thiết bị di động để xem bản đồ và các gian hàng.</Text>
            </View>
            {/* The children will not be rendered on the web map since there is no actual map */}
            <View style={{ display: 'none' }}>
                {children}
            </View>
        </View>
    );
};

export const Marker = ({ children, onPress, ...props }: any) => {
    // For web, markers can just be hidden or render minimal UI 
    // They are inside the display: none container above anyway
    return (
        <TouchableOpacity onPress={onPress} {...props}>
            {children}
        </TouchableOpacity>
    );
};

export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f3f4f6', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    webMessageContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    webMessageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4b5563',
        marginBottom: 8,
    },
    webMessageText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    }
});

export default MapView;
