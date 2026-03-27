import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import useLocationTracking from '../hooks/useLocationTracking';
import POIModal from '../components/POIModal';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  // Custom hook for nearby POI alerts
  const { 
    nearbyStore, 
    isModalVisible, 
    closeALert 
  } = useLocationTracking(15000, 0.05); // Check every 15s, 50m radius

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scanner/index" options={{ headerShown: true, title: 'Scanner' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

        {/* THÊM DÒNG NÀY ĐỂ ĐĂNG KÝ ROUTE CHO SHOP */}
        <Stack.Screen
          name="shop/[id]"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="stall/[id]"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="plans/index"
          options={{
            headerShown: false,
            title: 'Gói hội viên',
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="plans/payment"
          options={{
            headerShown: false,
            title: 'Thanh toán',
            presentation: 'modal'
          }}
        />
      </Stack>
      <StatusBar style="auto" />

      {/* Global POI Alert Modal */}
      {nearbyStore && (
        <POIModal
          isVisible={isModalVisible}
          onClose={closeALert}
          onConfirm={() => {
            closeALert();
            router.push(`/stall/${nearbyStore.id}` as any);
          }}
          storeName={nearbyStore.name}
          storeImage={nearbyStore.coverImage}
          distance={nearbyStore.distance}
        />
      )}
    </ThemeProvider>
  );
}
