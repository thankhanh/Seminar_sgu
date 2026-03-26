import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { CartProvider } from '../context/CartContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <CartProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scanner/index" options={{ headerShown: true, title: 'Scanner' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

          {/* THÊM DÒNG NÀY ĐỂ ĐĂNG KÝ ROUTE CHO SHOP */}
          <Stack.Screen
            name="stall/[id]"
            options={{
              headerShown: false, // Ẩn header mặc định vì bạn đã tự làm header trong code rồi
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="profile/edit"
            options={{
              headerShown: false,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="cart/index"
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="checkout/index"
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="orders/index"
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CartProvider>
  );
}
